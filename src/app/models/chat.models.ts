export interface KnowledgeSource {
  name: string;
}

export interface AiResponse {
  answer: string;
  sources: KnowledgeSource[];
  confidence: number;
  disclaimer: string;
}

export type FeedbackType = 'helpful' | 'not-helpful';

export interface ChatMessage {
  id: string;
  role: 'agent' | 'assistant';
  text: string;
  timestamp: string;
  response?: AiResponse;
  feedback?: FeedbackType;
}
