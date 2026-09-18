import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateTokens, estimateChatTokens, checkTokenLimit, MODEL_CONFIGS } from '../src/index.js';

test('estimateTokens - Basic strings', () => {
  assert.equal(estimateTokens(''), 0);
  assert.equal(estimateTokens(null), 0);
  assert.equal(estimateTokens('hello world'), 2);
  assert.ok(estimateTokens('The quick brown fox jumps over the lazy dog.') >= 9);
});

test('estimateTokens - Code snippet', () => {
  const code = `
    function calculateSum(a, b) {
      return a + b;
    }
  `;
  const count = estimateTokens(code);
  assert.ok(count >= 10 && count <= 30);
});

test('estimateTokens - CJK glyphs', () => {
  const zh = '你好世界';
  const count = estimateTokens(zh);
  // In tokenizers, 4 Chinese characters are approximately 4-6 tokens
  assert.ok(count >= 4 && count <= 8);
});

test('estimateChatTokens', () => {
  const messages = [
    { role: 'system', content: 'You are a helpful coding assistant.' },
    { role: 'user', content: 'How do I sort an array in JavaScript?' }
  ];

  const result = estimateChatTokens(messages, 'gpt-4o');
  assert.ok(result.totalTokens > 0);
  assert.ok(result.messagesTokens > 0);
  assert.equal(result.overheadTokens, 3);
  assert.equal(result.breakdown.length, 2);
  assert.equal(result.breakdown[0].role, 'system');
  assert.equal(result.breakdown[1].role, 'user');
});

test('checkTokenLimit', () => {
  const text = 'Hello world, checking limits.';
  const res = checkTokenLimit(text, 100);
  assert.equal(res.withinLimit, true);
  assert.ok(res.remaining > 80);
  assert.ok(res.usagePercent < 20);

  const overflow = checkTokenLimit(text, 2);
  assert.equal(overflow.withinLimit, false);
});

test('MODEL_CONFIGS contains major frontier models', () => {
  assert.ok(MODEL_CONFIGS['gpt-4o']);
  assert.ok(MODEL_CONFIGS['claude-3-5-sonnet']);
  assert.ok(MODEL_CONFIGS['gemini-1.5-pro']);
});
