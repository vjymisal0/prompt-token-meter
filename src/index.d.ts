export interface ChatMessage {
  role?: string;
  content: string | any;
}

export interface ChatTokenBreakdown {
  index: number;
  role: string;
  tokens: number;
}

export interface ChatTokenResult {
  totalTokens: number;
  messagesTokens: number;
  overheadTokens: number;
  breakdown: ChatTokenBreakdown[];
}

export interface TokenLimitResult {
  withinLimit: boolean;
  tokens: number;
  remaining: number;
  usagePercent: number;
}

export declare const MODEL_CONFIGS: Record<string, { charToTokenRatio: number; msgPadding: number; name: string }>;

export declare function estimateTokens(text: string, model?: string): number;

export declare function estimateChatTokens(messages: ChatMessage[], model?: string): ChatTokenResult;

export declare function checkTokenLimit(
  input: string | ChatMessage[],
  maxLimit: number,
  model?: string
): TokenLimitResult;

export default estimateTokens;
