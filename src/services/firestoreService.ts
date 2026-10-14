import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { Bounty, VulnerabilityReport } from '../domain/types';

// Collection names
const BOUNTIES_COLLECTION = 'bounties';
const REPORTS_COLLECTION = 'reports';

/**
 * Converts a Firestore document to a Bounty object.
 * @param docRef Firestore document snapshot
 * @returns Bounty object
 */
const bountyFromDoc = (docRef: QueryDocumentSnapshot): Bounty => {
  const data = docRef.data();
  return {
    id: docRef.id,
    title: data.title,
    organizationId: data.organizationId,
    organizationName: data.organizationName,
    organizationTrustScore: data.organizationTrustScore,
    severity: data.severity,
    rewardAmount: data.rewardAmount,
    rewardCurrency: data.rewardCurrency,
    scope: data.scope,
    rules: data.rules,
    deadline: data.deadline,
    verificationRequirements: data.verificationRequirements,
    status: data.status,
    escrowId: data.escrowId,
    escrowStatus: data.escrowStatus ?? '',
    fundingTxHash: data.fundingTxHash ?? '',
    escrowAmountEth: data.escrowAmountEth ?? 0,
    escrowDemoRate: data.escrowDemoRate ?? 0,
    description: data.description,
  };
};

/**
 * Converts a Bounty object to a Firestore-compatible object.
 * We remove the id because it will be the document ID.
 * We also handle any Firestore-specific types (like Timestamp) if needed.
 * For now, we assume all fields are basic types.
 * @param bounty Bounty object
 * @returns Object suitable for Firestore (without id field)
 */
const bountyToFirestore = (bounty: Omit<Bounty, 'id'>) => {
  return {
    title: bounty.title,
    organizationId: bounty.organizationId,
    organizationName: bounty.organizationName,
    organizationTrustScore: bounty.organizationTrustScore,
    severity: bounty.severity,
    rewardAmount: bounty.rewardAmount,
    rewardCurrency: bounty.rewardCurrency,
    scope: bounty.scope,
    rules: bounty.rules,
    deadline: bounty.deadline,
    verificationRequirements: bounty.verificationRequirements,
    status: bounty.status,
    escrowId: bounty.escrowId,
    escrowStatus: bounty.escrowStatus,
    fundingTxHash: bounty.fundingTxHash,
    escrowAmountEth: bounty.escrowAmountEth,
    escrowDemoRate: bounty.escrowDemoRate,
    description: bounty.description,
  };
};

/**
 * Get all bounties from Firestore.
 * @returns Array of Bounty objects
 */
export const getBounties = async (): Promise<Bounty[]> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const bountyCol = collection(db, BOUNTIES_COLLECTION);
  const bountySnapshot = await getDocs(bountyCol);
  console.log('[getBounties] Fetched bounty docs:', bountySnapshot.docs.map(doc => doc.id));
  return bountySnapshot.docs.map(bountyFromDoc);
};

/**
 * Get a bounty by its ID.
 * @param bountyId The ID of the bounty to retrieve
 * @returns Bounty object if found, otherwise null
 */
export const getBountyById = async (bountyId: string): Promise<Bounty | null> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const bountyDoc = doc(db, BOUNTIES_COLLECTION, bountyId);
  const bountySnap = await getDoc(bountyDoc);

  if (bountySnap.exists()) {
    return bountyFromDoc(bountySnap);
  }

  return null;
};

/**
 * Create a new bounty in Firestore.
 * @param bounty The bounty object to create (without id)
 * @returns The ID of the created bounty
 */
export const createBounty = async (bounty: Omit<Bounty, 'id'>): Promise<string> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const bountyCol = collection(db, BOUNTIES_COLLECTION);
  const docRef = await addDoc(bountyCol, bountyToFirestore(bounty));
  return docRef.id;
};

/**
 * Update an existing bounty.
 * @param bountyId The ID of the bounty to update
 * @param data The partial bounty data to update
 */
export const updateBounty = async (
  bountyId: string,
  data: Partial<Omit<Bounty, 'id'>>
): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const bountyDoc = doc(db, BOUNTIES_COLLECTION, bountyId);
  await updateDoc(bountyDoc, data);
};

/**
 * Delete a bounty by its ID.
 * @param bountyId The ID of the bounty to delete
 */
export const deleteBounty = async (bountyId: string): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const bountyDoc = doc(db, BOUNTIES_COLLECTION, bountyId);
  await deleteDoc(bountyDoc);
};

/**
 * Converts a Firestore document to a VulnerabilityReport object.
 * @param docRef Firestore document snapshot
 * @returns VulnerabilityReport object
 */
const reportFromDoc = (docRef: QueryDocumentSnapshot): VulnerabilityReport => {
  const data = docRef.data();
  if (!data) {
    throw new Error('Firestore document data is null or undefined');
  }

  return {
    id: docRef.id,
    bountyId: data.bountyId,
    researcherId: data.researcherId,
    title: data.title,
    vulnerabilityType: data.vulnerabilityType,
    severity: data.severity,
    description: data.description,
    reproductionSteps: data.reproductionSteps,
    impact: data.impact,
    evidence: data.evidence,
    createdAt: data.createdAt
  } as VulnerabilityReport;
};

/**
 * Converts a VulnerabilityReport object to a Firestore-compatible object.
 * We remove the id because it will be the document ID.
 * @param report VulnerabilityReport object
 * @returns Object suitable for Firestore (without id field)
 */
const reportToFirestore = (report: Omit<VulnerabilityReport, 'id'>) => {
  return {
    ...report
  };
};

/**
 * Get all reports from Firestore.
 * @returns Array of VulnerabilityReport objects
 */
export const getReports = async (): Promise<VulnerabilityReport[]> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const reportsCol = collection(db, REPORTS_COLLECTION);
  const reportsSnapshot = await getDocs(reportsCol);
  console.log('[getReports] Fetched report docs:', reportsSnapshot.docs.map(doc => doc.id));
  return reportsSnapshot.docs.map(reportFromDoc);
};

/**
 * Get a report by its ID.
 * @param reportId The ID of the report to retrieve
 * @returns VulnerabilityReport object if found, otherwise null
 */
export const getReportById = async (reportId: string): Promise<VulnerabilityReport | null> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const reportDoc = doc(db, REPORTS_COLLECTION, reportId);
  const reportSnap = await getDoc(reportDoc);

  if (reportSnap.exists()) {
    return reportFromDoc(reportSnap);
  }

  return null;
};

/**
 * Create a new report in Firestore.
 * @param report The report object to create (without id)
 * @returns The ID of the created report
 */
export const createReport = async (report: Omit<VulnerabilityReport, 'id'>): Promise<string> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const reportsCol = collection(db, REPORTS_COLLECTION);
  const docRef = await addDoc(reportsCol, reportToFirestore(report));
  return docRef.id;
};

/**
 * Update an existing report.
 * @param reportId The ID of the report to update
 * @param data The partial report data to update
 */
export const updateReport = async (
  reportId: string,
  data: Partial<Omit<VulnerabilityReport, 'id'>>
): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const reportDoc = doc(db, REPORTS_COLLECTION, reportId);
  await updateDoc(reportDoc, data);
};

/**
 * Delete a report by its ID.
 * @param reportId The ID of the report to delete
 */
export const deleteReport = async (reportId: string): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const reportDoc = doc(db, REPORTS_COLLECTION, reportId);
  await deleteDoc(reportDoc);
};