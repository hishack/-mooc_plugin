import type { AIProvider, ModelItem } from './types'

export const AI_MODELS: ModelItem[] = [
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
  {
    provider: 'glm',
    model: 'glm-4.6',     
    alias: 'glm46',       
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    name: 'GLM-4.6'
  },
  {
    provider: 'doubao',
    model: 'doubao-seed-1.6',
    alias: 'doubao1',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    name: '豆包'
  }
]

export function getModelByAlias(alias: string): ModelItem | undefined {
  return AI_MODELS.find(model => model.alias === alias)
}

export function getModelsByProvider(provider: AIProvider): ModelItem[] {
  return AI_MODELS.filter(model => model.provider === provider)
}

export function getAllAliases(): string[] {
  return AI_MODELS.map(model => model.alias)
}

export function isValidAlias(alias: string): boolean {
  return getAllAliases().includes(alias)
}