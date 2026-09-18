# prompt-token-meter

> Blazing fast zero-dependency token estimator and budget calculator for OpenAI, Claude, and Gemini prompt engineering without bulky WASM or BPE table binaries.

[![npm version](https://img.shields.io/npm/v/prompt-token-meter.svg)](https://www.npmjs.com/package/prompt-token-meter)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Why prompt-token-meter?

Full BPE tokenizers like `tiktoken` or `@anthropic-ai/tokenizer` require massive 10MB–25MB WASM binary tables that bloat Lambda, Cloudflare Workers, and frontend bundles.

`prompt-token-meter`:
- ⚡ **Zero dependencies** (< 4KB total size).
- 🏎️ **Runs anywhere**: Edge runtime, Cloudflare Workers, Node.js, Bun, Browser.
- 🎯 **High accuracy**: Sub-word regex token boundary detection tuned against `gpt-4o`, `claude-3-5-sonnet`, and `gemini-1.5-pro`.
- 💬 **Chat Completion message support**: Accurately computes role framing and system overhead tokens.

## Installation

```bash
npm install prompt-token-meter
# or
pnpm add prompt-token-meter
```

## Quick Start

### 1. Estimate Tokens for Text

```javascript
import { estimateTokens } from 'prompt-token-meter';

const text = "Explain quantum computing in simple terms.";
const tokens = estimateTokens(text, 'gpt-4o');
console.log(tokens); // ~7 tokens
```

### 2. Estimate Chat Completion Array

```javascript
import { estimateChatTokens } from 'prompt-token-meter';

const messages = [
  { role: 'system', content: 'You are a senior TypeScript architect.' },
  { role: 'user', content: 'How do I build a micro-frontend architecture?' }
];

const result = estimateChatTokens(messages, 'claude-3-5-sonnet');
console.log(result);
/*
{
  totalTokens: 25,
  messagesTokens: 22,
  overheadTokens: 3,
  breakdown: [
    { index: 0, role: 'system', tokens: 11 },
    { index: 1, role: 'user', tokens: 11 }
  ]
}
*/
```

### 3. Check Token Budget Before API Calls

```javascript
import { checkTokenLimit } from 'prompt-token-meter';

const status = checkTokenLimit(promptText, 4096, 'gpt-4o');
if (!status.withinLimit) {
  console.warn(`Prompt exceeds budget! Used: ${status.tokens}, Limit: 4096`);
}
```

## Supported Models

- `gpt-4o`, `gpt-4`, `gpt-3.5-turbo`
- `claude-3-5-sonnet`, `claude-3-opus`, `claude-3-haiku`
- `gemini-1.5-pro`, `gemini-1.5-flash`, `gemini-2.0-flash`

## License

MIT © [vjymisal0](https://github.com/vjymisal0)
