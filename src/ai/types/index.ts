export type { AIProvider, ModelInfo, ProviderConfig, ProviderStorage, GlobalStorage } from './providers'

// 兼容性类型
export interface TokenInfo {
  token: string
  model: string
  token_rest_money: string
  establish_time: string
}

export interface ClientInstance {
  client: any
  model: string
}

export interface ApiPayload {
  questions: string
}

export interface AIResponse {
  id: number
  answer: string[]
}

export interface ValidationResult {
  success: boolean
  message: string
  details?: any
}

// 从utils/constants重新导出
export type { QuestionInfo, QuestionsAnswer, Answer } from '../../utils/constants'