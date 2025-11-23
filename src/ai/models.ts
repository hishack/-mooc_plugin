import type{ ModelItem, AIProvider } from './types'

/**
 * All available AI model configurations
 * To add a new model, simply append a new configuration to this array
 */
export const AI_MODELS: ModelItem[] = [
  // DeepSeek Models
  {
    provider: 'deepseek',
    model: 'deepseek-chat',
    alias: 'v1',
    baseURL: 'https://api.deepseek.com',
    name: 'DeepSeek Chat'
  },
  {
    provider: 'deepseek',
    model: 'deepseek-reasoner',
    alias: 'R1',
    baseURL: 'https://api.deepseek.com',
    name: 'DeepSeek Reasoner'
  },

  // GLM Models
  {
    provider: 'glm',
    model: 'glm-4',
    alias: 'glm4',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    name: 'GLM-4'
  },

  // Doubao Models
  {
    provider: 'doubao',
    model: 'doubao-pro-4k',
    alias: 'doubao1',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    name: '豆包 Pro 4K'
  }
]

/**
 * Get model configuration by alias
 */
export function getModelByAlias(alias: string): ModelItem | undefined {
  return AI_MODELS.find(model => model.alias === alias)
}

/**
 * Get all models by provider
 */
export function getModelsByProvider(provider: AIProvider): ModelItem[] {
  return AI_MODELS.filter(model => model.provider === provider)
}

/**
 * Get all available aliases
 */
export function getAllAliases(): string[] {
  return AI_MODELS.map(model => model.alias)
}

/**
 * Check if alias exists
 */
export function isValidAlias(alias: string): boolean {
  return getAllAliases().includes(alias)
}