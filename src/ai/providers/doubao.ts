import type { ProviderConfig, ModelInfo } from '../types/providers'

export const DOUBAO_PROVIDER: ProviderConfig = {
  id: 'doubao',
  name: '豆包',
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  models: [
    {
      id: 'doubao-1-5-pro-32k-250115',
      name: '豆包 Seed 1.6 Thinking',
      alias: 'doubao-thinking',
      description: '推理能力最强的豆包文本模型'
    }
  ]
}

export class DoubaoProvider {
  static getModelById(modelId: string): ModelInfo | undefined {
    return DOUBAO_PROVIDER.models.find(model => model.id === modelId)
  }

  static getModelByAlias(alias: string): ModelInfo | undefined {
    return DOUBAO_PROVIDER.models.find(model => model.alias === alias)
  }

  static getAllAliases(): string[] {
    return DOUBAO_PROVIDER.models.map(model => model.alias)
  }

  static getAllModelIds(): string[] {
    return DOUBAO_PROVIDER.models.map(model => model.id)
  }

  static getDefaultModel(): ModelInfo {
    return DOUBAO_PROVIDER.models[0] // Doubao-Seed-1.6-thinking
  }

  static getRecommendedModel(): ModelInfo {
    return DOUBAO_PROVIDER.models[0]
  }
}
