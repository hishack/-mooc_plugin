import type { ProviderConfig, ModelInfo } from '../types/providers'

export const DEEPSEEK_PROVIDER: ProviderConfig = {
  id: 'deepseek',
  name: 'DeepSeek',
  baseURL: 'https://api.deepseek.com',
  models: [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      alias: 'v1',
      description: '通用对话模型，适合日常问答和任务'
    },
    {
      id: 'deepseek-reasoner',
      name: 'DeepSeek Reasoner',
      alias: 'R1',
      description: '推理模型，擅长复杂问题和逻辑推理'
    }
  ]
}

export class DeepSeekProvider {
  static getModelById(modelId: string): ModelInfo | undefined {
    return DEEPSEEK_PROVIDER.models.find(model => model.id === modelId)
  }

  static getModelByAlias(alias: string): ModelInfo | undefined {
    return DEEPSEEK_PROVIDER.models.find(model => model.alias === alias)
  }

  static getAllAliases(): string[] {
    return DEEPSEEK_PROVIDER.models.map(model => model.alias)
  }

  static getAllModelIds(): string[] {
    return DEEPSEEK_PROVIDER.models.map(model => model.id)
  }

  // 获取默认模型
  static getDefaultModel(): ModelInfo {
    return DEEPSEEK_PROVIDER.models[0] 
  }

  // 获取推荐的模型
  static getRecommendedModel(): ModelInfo {
    return DEEPSEEK_PROVIDER.models.find(model => model.alias === 'R1') || DEEPSEEK_PROVIDER.models[0]
  }
}