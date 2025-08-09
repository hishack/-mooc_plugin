
export const BROWSER_STORAGE_KEY = 'ai-mooc-plugins'

export type SettingsInfo = {
  model: string;
  theme: string;
  apiKey: string;

}

// 选项信息接口
export interface QuestionOption {
  letter: string; 
  content: string; 
}

// 题目信息主接口
export interface QuestionInfo {
  index: number; 
  type: '单选' | '多选'; 
  content: string; // 题目内
  options: QuestionOption[]; 
}

export interface QuestionsAnswer{
  'id': number
  'answer': string[]
}
export interface Answer{
  answer:QuestionsAnswer[]
}
    