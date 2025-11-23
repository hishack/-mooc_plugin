import type{ QuestionInfo, QuestionsAnswer, Answer } from '../utils/constants'

// Provider types supported by the system
export type AIProvider = 'deepseek' | 'glm' | 'doubao'

// Model alias types used for storage and UI
export type ModelAlias = 'v1' | 'R1' | 'glm4' | 'doubao1'

// Token information stored in local storage
export interface TokenInfo {
  token: string
  model: string // ModelAlias
  token_rest_money: string
  establish_time: string
}

// Model configuration interface
export interface ModelItem {
  provider: AIProvider
  model: string // Real model name
  alias: string // User-facing alias for storage and UI
  baseURL: string
  name: string // Display name
}

// Client instance wrapper
export interface ClientInstance {
  client: any // OpenAI client instance
  model: string // Real model name
}

// API request payload
export interface ApiPayload {
  questions: string
}

// Response format expected from AI models
export interface AIResponse {
  id: number
  answer: string[]
}

// Extended answer types for compatibility
export type { QuestionInfo, QuestionsAnswer, Answer }

// Storage configuration
export interface StorageConfig {
  token: string
  model: string
  token_rest_money: string
  establish_time: string
}