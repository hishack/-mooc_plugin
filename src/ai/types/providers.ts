export type AIProvider = 'deepseek' | 'glm' | 'doubao'

export interface ModelInfo {
  id: string          // 实际模型ID，如 'deepseek-chat'
  name: string        // 显示名称，如 'DeepSeek Chat'
  alias: string       // 用户友好的别名，如 'v1'
  description?: string // 模型描述
}

export interface ProviderConfig {
  id: AIProvider      // Provider ID
  name: string        // Provider显示名称
  baseURL: string     // API基础URL
  models: ModelInfo[] // 该Provider下的所有模型
}

export interface ProviderStorage {
  provider: AIProvider
  apiKey: string
  enabledModels: string[]  // 启用的模型ID列表
  activeModel: string      // 当前激活的模型ID
  token_rest_money: string
  establish_time: string
}

export interface GlobalStorage {
  providers: Record<AIProvider, ProviderStorage | null>
  globalActiveProvider: AIProvider | null
}