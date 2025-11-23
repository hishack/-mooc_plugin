import type { QuestionInfo, QuestionsAnswer, Answer } from '../utils/constants'

export type AIProvider = 'deepseek' | 'glm' | 'doubao'

export type ModelAlias = 'v1' | 'R1' | 'glm4' | 'doubao1'

export interface TokenInfo {
  token: string
  model: string
  token_rest_money: string
  establish_time: string
}

export interface ModelItem {
  provider: AIProvider
  model: string
  alias: string
  baseURL: string
  name: string
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

export type { QuestionInfo, QuestionsAnswer, Answer }

export interface StorageConfig {
  token: string
  model: string
  token_rest_money: string
  establish_time: string
}