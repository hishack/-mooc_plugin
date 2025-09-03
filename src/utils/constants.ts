export const BROWSER_STORAGE_KEY = 'ai-mooc-plugins'

export type SettingsInfo = {
  model: string;
  theme: string;
  apiKey: string;
}

export interface QuestionOption {
  letter: string; 
  content: string; 
}

export interface QuestionInfo {
  index: number; 
  type: '单选' | '多选' | '判断' | '填空'; 
  content: string; 
  options?: QuestionOption[]; 
  blanks?: number; 
}

export interface QuestionsAnswer {
  id: number;
  answer: string[];
}

export interface Answer {
  answer: QuestionsAnswer[];
}
