import { DEEPSEEK_PROVIDER, DeepSeekProvider } from './deepseek'
import { GLM_PROVIDER, GLMProvider } from './glm'
import { DOUBAO_PROVIDER, DoubaoProvider } from './doubao'
import type { ProviderConfig, AIProvider, ModelInfo } from '../types/providers'

export const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  deepseek: DEEPSEEK_PROVIDER,
  glm: GLM_PROVIDER,
  doubao: DOUBAO_PROVIDER
}

export const PROVIDER_CLASSES = {
  deepseek: DeepSeekProvider,
  glm: GLMProvider,
  doubao: DoubaoProvider
}

export function getProviderById(id: AIProvider): ProviderConfig | undefined {
  return PROVIDERS[id]
}

export function getAllProviders(): ProviderConfig[] {
  return Object.values(PROVIDERS)
}

export function getAllProviderIds(): AIProvider[] {
  return Object.keys(PROVIDERS) as AIProvider[]
}

export function getProviderClasses() {
  return PROVIDER_CLASSES
}

// 兼容性：按别名查找模型和provider
export function findModelByAlias(alias: string): { provider: ProviderConfig; model: ModelInfo } | null {
  for (const provider of Object.values(PROVIDERS)) {
    const model = provider.models.find(m => m.alias === alias)
    if (model) {
      return { provider, model }
    }
  }
  return null
}

export function findProviderByModelAlias(alias: string): ProviderConfig | null {
  for (const provider of Object.values(PROVIDERS)) {
    if (provider.models.some(m => m.alias === alias)) {
      return provider
    }
  }
  return null
}