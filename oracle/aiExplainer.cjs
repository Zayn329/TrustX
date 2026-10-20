const DEFAULT_TIMEOUT_MS = 4000;
const MAX_EXPLANATION_CHARS = 1200;
const PROVIDER_DEFAULTS = {
  groq: {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'openai/gpt-oss-120b'
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini'
  }
};

function parseExplanation(content) {
  if (typeof content !== 'string') return null;
  const cleaned = content.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  try {
    const value = JSON.parse(cleaned);
    if (!value || typeof value !== 'object') return null;
    const summary = typeof value.summary === 'string' ? value.summary.trim() : '';
    const impact = typeof value.impact === 'string' ? value.impact.trim() : '';
    const limitations = typeof value.limitations === 'string' ? value.limitations.trim() : '';
    const confidence = value.confidence === 'low' || value.confidence === 'medium' || value.confidence === 'high'
      ? value.confidence
      : null;
    if (!summary || !impact || !limitations || !confidence) return null;
    const explanation = [
      `Summary: ${summary}`,
      `Impact: ${impact}`,
      `Confidence: ${confidence}`,
      `Limitation: ${limitations}`
    ].join(' ');
    return explanation.slice(0, MAX_EXPLANATION_CHARS);
  } catch {
    return null;
  }
}

async function explainFinding(finding) {
  const provider = (process.env.ORACLE_AI_PROVIDER || 'groq').toLowerCase();
  const apiKey = process.env.ORACLE_AI_API_KEY || (provider === 'groq' ? process.env.GROQ_API_KEY : undefined);
  if (process.env.ORACLE_AI_ENABLED !== 'true' || !apiKey) {
    return { status: 'unavailable', explanation: undefined, provider: undefined, model: undefined };
  }
  const defaults = PROVIDER_DEFAULTS[provider];
  if (!defaults) return { status: 'unavailable', explanation: undefined, provider, model: undefined };
  const endpoint = process.env.ORACLE_AI_BASE_URL || defaults.endpoint;
  const model = process.env.ORACLE_AI_MODEL || defaults.model;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 600,
        messages: [
          {
            role: 'system',
            content: 'You explain one deterministic static-analysis finding for a security report. Do not decide whether the vulnerability was reproduced, do not change severity, and do not recommend reputation or escrow actions. Return only valid JSON with exactly these fields: summary, impact, confidence (low|medium|high), limitations.'
          },
          {
            role: 'user',
            content: JSON.stringify({
              ruleId: finding.ruleId,
              severity: finding.severity,
              file: finding.file,
              line: finding.line,
              explanation: finding.explanation
            })
          }
        ]
      }),
      signal: controller.signal
    });
    if (!response.ok) return { status: 'unavailable', explanation: undefined, provider, model };
    const body = await response.json();
    const explanation = parseExplanation(body?.choices?.[0]?.message?.content);
    return explanation
      ? { status: 'available', explanation, provider, model }
      : { status: 'unavailable', explanation: undefined, provider, model };
  } catch {
    return { status: 'unavailable', explanation: undefined, provider, model };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { explainFinding };
