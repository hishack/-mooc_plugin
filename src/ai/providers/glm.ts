import type { ProviderConfig, ModelInfo } from '../types/providers'

export const GLM_PROVIDER: ProviderConfig = {
  id: 'glm',
  name: 'GLM',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  models: [
    {
      id: 'glm-4.6',
      name: 'GLM-4.6',
      alias: 'glm4',
      description: '智谱AI的最新大语言模型，增强版本'
    }
  ]
}

export class GLMProvider {
  static getModelById(modelId: string): ModelInfo | undefined {
    return GLM_PROVIDER.models.find(model => model.id === modelId)
  }

  static getModelByAlias(alias: string): ModelInfo | undefined {
    return GLM_PROVIDER.models.find(model => model.alias === alias)
  }

  static getAllAliases(): string[] {
    return GLM_PROVIDER.models.map(model => model.alias)
  }

  static getAllModelIds(): string[] {
    return GLM_PROVIDER.models.map(model => model.id)
  }

  // 获取默认模型
  static getDefaultModel(): ModelInfo {
    return GLM_PROVIDER.models[0]
  }

  // 获取推荐的模型
  static getRecommendedModel(): ModelInfo {
    return GLM_PROVIDER.models[0]
  }
}