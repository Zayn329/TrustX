const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const oracleGatewayToken = defineSecret('ORACLE_GATEWAY_TOKEN');

function requireCompany(request) {
  if (!request.auth || request.auth.token.role !== 'company') {
    throw new HttpsError('permission-denied', 'A company role is required.');
  }
  return request.auth.uid;
}

async function ownedReport(reportId, companyId) {
  const report = await db.collection('reports').doc(reportId).get();
  if (!report.exists || report.data().companyId !== companyId) {
    throw new HttpsError('permission-denied', 'You are not authorized to manage this report.');
  }
  return report;
}

exports.reviewReport = onCall(async (request) => {
  const companyId = requireCompany(request);
  const { reportId, decision, response = '' } = request.data || {};
  if (!['accepted', 'rejected', 'needs_info'].includes(decision) || typeof response !== 'string' || response.length > 4000) {
    throw new HttpsError('invalid-argument', 'A valid decision and response are required.');
  }
  await ownedReport(reportId, companyId);
  await db.collection('reports').doc(reportId).update({ status: decision, companyResponse: response, reviewedAt: admin.firestore.FieldValue.serverTimestamp() });
  return { status: decision };
});

exports.runReportVerification = onCall({ secrets: [oracleGatewayToken] }, async (request) => {
  const companyId = requireCompany(request);
  const { reportId } = request.data || {};
  const report = await ownedReport(reportId, companyId);
  const bounty = await db.collection('bounties').doc(report.data().bountyId).get();
  if (!bounty.exists) throw new HttpsError('failed-precondition', 'The associated bounty no longer exists.');
  const gateway = process.env.ORACLE_SERVICE_URL;
  if (!gateway) throw new HttpsError('failed-precondition', 'Oracle gateway is not configured.');
  const payload = { reportId, bountyId: bounty.id, scope: bounty.data().scope || [], targetId: bounty.data().oracleTargetId, reproductionSteps: report.data().reproductionSteps, evidenceHash: report.data().evidenceHash, idempotencyKey: `report-${reportId}` };
  const response = await fetch(`${gateway}/evaluate`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-trustx-gateway-token': oracleGatewayToken.value() }, body: JSON.stringify(payload) });
  if (!response.ok) throw new HttpsError('unavailable', 'The oracle gateway did not complete verification.');
  const evidence = await response.json();
  await db.collection('verifications').doc(reportId).set({ contributionId: reportId, companyId, researcherId: report.data().researcherId, status: 'pending', oracleExecutionId: evidence.executionId, oracleRequestHash: evidence.requestHash, oracleEvidenceHash: evidence.evidenceHash, oracleVerifierVersion: evidence.verifierVersion, oracleStatus: evidence.status, oracleSignature: evidence.signature, oraclePublicKey: evidence.publicKeySpkiBase64, verificationSource: 'oracle_runtime', recordedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
  return { executionId: evidence.executionId, status: evidence.status };
});
