export interface DemoMessageRequest {
  message: string;
}

export interface DemoMessageResponse {
  success: boolean;
  message: string;
  contentResponse?: {
    success: boolean;
    receivedAt: string;
    originalMessage: string;
    reply: string;
  };
}

export interface QuestionsRequest {}

export interface QuestionsResponse {
  questions: string[] | null;
}