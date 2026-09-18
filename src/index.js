// Token configurations calibrated against cl100k/o200k (OpenAI), Claude, and Gemini tokenizers
export const MODEL_CONFIGS = {
  'gpt-4o': { charToTokenRatio: 3.75, msgPadding: 3, name: 'OpenAI GPT-4o' },
  'gpt-4': { charToTokenRatio: 3.85, msgPadding: 4, name: 'OpenAI GPT-4' },
  'gpt-3.5-turbo': { charToTokenRatio: 3.85, msgPadding: 4, name: 'OpenAI GPT-3.5 Turbo' },
  'claude-3-5-sonnet': { charToTokenRatio: 3.70, msgPadding: 3, name: 'Anthropic Claude 3.5 Sonnet' },
  'claude-3-opus': { charToTokenRatio: 3.70, msgPadding: 3, name: 'Anthropic Claude 3 Opus' },
  'claude-3-haiku': { charToTokenRatio: 3.70, msgPadding: 3, name: 'Anthropic Claude 3 Haiku' },
  'gemini-1.5-pro': { charToTokenRatio: 3.90, msgPadding: 2, name: 'Google Gemini 1.5 Pro' },
  'gemini-1.5-flash': { charToTokenRatio: 3.90, msgPadding: 2, name: 'Google Gemini 1.5 Flash' },
  'gemini-2.0-flash': { charToTokenRatio: 3.90, msgPadding: 2, name: 'Google Gemini 2.0 Flash' }
};

// Standard GPT/Claude-style regex pattern that captures words with leading whitespace, punctuation, etc.
const BPE_LIKE_REGEX = /(?:[^\r\n\p{L}\p{N}]?[\p{L}]+|\p{N}{1,3}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+)/gu;
const CJK_REGEX = /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/u;

/**
 * Accurately estimates token count for a piece of text without WASM binaries.
 *
 * @param {string} text
 * @param {string} [model='gpt-4o']
 * @returns {number}
 */
export function estimateTokens(text, model = 'gpt-4o') {
  if (!text || typeof text !== 'string') return 0;
  if (text.length === 0) return 0;

  const config = MODEL_CONFIGS[model] || MODEL_CONFIGS['gpt-4o'];

  let estimatedTokens = 0;
  const matches = text.match(BPE_LIKE_REGEX);

  if (!matches || matches.length === 0) {
    return Math.max(1, Math.ceil(text.length / config.charToTokenRatio));
  }

  for (const chunk of matches) {
    if (CJK_REGEX.test(chunk)) {
      // CJK characters average ~1 to 1.3 tokens per glyph
      estimatedTokens += Math.ceil(chunk.length * 1.2);
    } else {
      // Most English words under 7 chars (e.g. " hello", " world", " computer") map to a single token in BPE vocabularies
      const trimmed = chunk.trim();
      if (trimmed.length <= 6) {
        estimatedTokens += 1;
      } else {
        estimatedTokens += Math.max(1, Math.ceil(trimmed.length / config.charToTokenRatio));
      }
    }
  }

  return Math.max(1, estimatedTokens);
}

/**
 * Estimates token count for chat completion messages array:
 * [{ role: 'system' | 'user' | 'assistant', content: '...' }]
 *
 * @param {Array<{ role?: string, content: string | any }>} messages
 * @param {string} [model='gpt-4o']
 * @returns {{
 *   totalTokens: number,
 *   messagesTokens: number,
 *   overheadTokens: number,
 *   breakdown: Array<{ index: number, role: string, tokens: number }>
 * }}
 */
export function estimateChatTokens(messages, model = 'gpt-4o') {
  if (!Array.isArray(messages)) {
    return { totalTokens: 0, messagesTokens: 0, overheadTokens: 0, breakdown: [] };
  }

  const config = MODEL_CONFIGS[model] || MODEL_CONFIGS['gpt-4o'];
  const msgPadding = config.msgPadding;

  let messagesTokens = 0;
  const breakdown = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const role = msg?.role || 'user';
    const content = typeof msg?.content === 'string' ? msg.content : JSON.stringify(msg?.content || '');

    const contentTokens = estimateTokens(content, model);
    const roleTokens = estimateTokens(role, model);
    const itemTokens = contentTokens + roleTokens + msgPadding;

    messagesTokens += itemTokens;
    breakdown.push({
      index: i,
      role,
      tokens: itemTokens
    });
  }

  // System base turn overhead (typically 3 tokens for assistant response framing)
  const overheadTokens = 3;
  const totalTokens = messagesTokens + overheadTokens;

  return {
    totalTokens,
    messagesTokens,
    overheadTokens,
    breakdown
  };
}

/**
 * Checks whether text or messages fit within a target token budget.
 *
 * @param {string | Array<any>} input
 * @param {number} maxLimit - Token context limit
 * @param {string} [model='gpt-4o']
 * @returns {{ withinLimit: boolean, tokens: number, remaining: number, usagePercent: number }}
 */
export function checkTokenLimit(input, maxLimit, model = 'gpt-4o') {
  const tokens = Array.isArray(input)
    ? estimateChatTokens(input, model).totalTokens
    : estimateTokens(input, model);

  const remaining = Math.max(0, maxLimit - tokens);
  const usagePercent = Number(Math.min(100, (tokens / maxLimit) * 100).toFixed(2));

  return {
    withinLimit: tokens <= maxLimit,
    tokens,
    remaining,
    usagePercent
  };
}
