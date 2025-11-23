import { useEffect, useState } from 'react'
import { Storage } from "@plasmohq/storage"
import { checkBalance } from '~utils/balanceCheck'
import type { ProviderStorage, GlobalStorage, AIProvider } from '~/ai/types'
import { getProviderById, getProviderClasses } from '~/ai/providers'

const STORAGE_KEYS = {
  PROVIDER_STORAGE: 'provider_storage'
} as const

export function useProviderStorage() {
  const [storage, setStorage] = useState<GlobalStorage>({
    providers: {
      deepseek: null,
      glm: null,
      doubao: null
    },
    globalActiveProvider: null
  })
  const [loading, setLoading] = useState(true)
  const storageInstance = new Storage({ area: "local" })

  useEffect(() => {
    const initializeProviderStorage = async () => {
      try {
        const storedData = await storageInstance.get<GlobalStorage>(STORAGE_KEYS.PROVIDER_STORAGE)

        if (storedData) {
          setStorage(storedData)
        } else {
          // 迁移从旧的多token系统
          await migrateFromOldSystem()
        }

        setLoading(false)
      } catch (error) {
        console.error("❌ 加载Provider配置失败:", error)
        setLoading(false)
      }
    }

    initializeProviderStorage()
  }, [])

  const migrateFromOldSystem = async () => {
    try {
      const providerClasses = getProviderClasses()

      // 先检查是否有旧的单token系统
      const oldSingleToken = await storageInstance.get('token')
      if (oldSingleToken) {
        console.log('🔄 发现旧的单token系统，开始迁移...')

        // 获取DeepSeek的推荐模型
        const deepseekClass = providerClasses.deepseek
        const recommendedModel = deepseekClass?.getRecommendedModel()
        const defaultModel = deepseekClass?.getDefaultModel()

        // 优先使用推荐模型，如果旧的模型不可用则使用推荐/默认模型
        const activeModel = (oldSingleToken.model === 'v1' || oldSingleToken.model === 'R1')
          ? oldSingleToken.model
          : (recommendedModel?.alias || defaultModel?.alias || 'v1')

        const newStorage: GlobalStorage = {
          providers: {
            deepseek: {
              provider: 'deepseek',
              apiKey: oldSingleToken.token,
              enabledModels: ['v1', 'R1'],
              activeModel: activeModel,
              token_rest_money: oldSingleToken.token_rest_money,
              establish_time: oldSingleToken.establish_time
            },
            glm: null,
            doubao: null
          },
          globalActiveProvider: 'deepseek'
        }
        await storageInstance.set(STORAGE_KEYS.PROVIDER_STORAGE, newStorage)
        setStorage(newStorage)
        // 删除旧存储
        await storageInstance.remove('token')
        console.log('✅ 单token系统迁移完成')
        return
      }

      // 检查多token系统
      const oldStorage = await storageInstance.get('multi_tokens')
      if (oldStorage?.tokens) {
        console.log('🔄 发现旧的多token系统，开始迁移...')

        const newStorage: GlobalStorage = {
          providers: {
            deepseek: null,
            glm: null,
            doubao: null
          },
          globalActiveProvider: null
        }

        // 迁移DeepSeek相关的token
        const deepseekAliases = ['v1', 'R1']
        const deepseekTokens = deepseekAliases.map(alias => oldStorage.tokens[alias]).filter(Boolean)

        if (deepseekTokens.length > 0) {
          // 使用第一个可用的DeepSeek token
          const firstDeepseekToken = deepseekTokens[0]
          const deepseekClass = providerClasses.deepseek
          const recommendedModel = deepseekClass?.getRecommendedModel()
          const defaultModel = deepseekClass?.getDefaultModel()

          // 智能选择激活模型：优先使用旧的激活模型，其次推荐模型，最后默认模型
          let activeModel = oldStorage.activeModel && deepseekAliases.includes(oldStorage.activeModel)
            ? oldStorage.activeModel
            : recommendedModel && deepseekAliases.includes(recommendedModel.alias)
            ? recommendedModel.alias
            : defaultModel?.alias || deepseekAliases[0]

          newStorage.providers.deepseek = {
            provider: 'deepseek',
            apiKey: firstDeepseekToken.token,
            enabledModels: deepseekAliases,
            activeModel: activeModel,
            token_rest_money: firstDeepseekToken.token_rest_money,
            establish_time: firstDeepseekToken.establish_time
          }
          if (oldStorage.activeModel && deepseekAliases.includes(oldStorage.activeModel)) {
            newStorage.globalActiveProvider = 'deepseek'
          }
        }

        // 迁移其他providers...
        const glmAlias = 'glm4'
        if (oldStorage.tokens[glmAlias]) {
          const oldToken = oldStorage.tokens[glmAlias]
          const glmClass = providerClasses.glm
          const glmModel = glmClass?.getDefaultModel()

          newStorage.providers.glm = {
            provider: 'glm',
            apiKey: oldToken.token,
            enabledModels: [glmModel?.id || 'glm-4.6'],
            activeModel: glmModel?.id || 'glm-4.6',
            token_rest_money: oldToken.token_rest_money,
            establish_time: oldToken.establish_time
          }
          if (oldStorage.activeModel === glmAlias) {
            newStorage.globalActiveProvider = 'glm'
          }
        }

        const doubaoAlias = 'doubao1'
        if (oldStorage.tokens[doubaoAlias]) {
          const oldToken = oldStorage.tokens[doubaoAlias]
          const doubaoClass = providerClasses.doubao
          const doubaoModel = doubaoClass?.getDefaultModel()

          newStorage.providers.doubao = {
            provider: 'doubao',
            apiKey: oldToken.token,
            enabledModels: [doubaoModel?.id || 'doubao-seed-1-6-251015'],
            activeModel: doubaoModel?.id || 'doubao-seed-1-6-251015',
            token_rest_money: oldToken.token_rest_money,
            establish_time: oldToken.establish_time
          }
          if (oldStorage.activeModel === doubaoAlias) {
            newStorage.globalActiveProvider = 'doubao'
          }
        }

        await storageInstance.set(STORAGE_KEYS.PROVIDER_STORAGE, newStorage)
        setStorage(newStorage)

        // 删除旧存储
        await storageInstance.remove('multi_tokens')
        console.log('✅ 迁移完成')
      }
    } catch (error) {
      console.error("❌ 数据迁移失败:", error)
    }
  }

  const updateProviderStorage = async (providerId: AIProvider, providerData: Partial<ProviderStorage>) => {
    try {
      const updatedStorage = {
        ...storage,
        providers: {
          ...storage.providers,
          [providerId]: {
            ...storage.providers[providerId],
            ...providerData,
            provider: providerId,
            establish_time: providerData.establish_time || new Date().toISOString()
          } as ProviderStorage
        }
      }

      // 更新余额信息
      if (providerData.apiKey && updatedStorage.providers[providerId]) {
        const balance = await checkBalance(providerData.apiKey, providerId)
        updatedStorage.providers[providerId]!.token_rest_money = balance || '0'
      }

      await storageInstance.set(STORAGE_KEYS.PROVIDER_STORAGE, updatedStorage)
      setStorage(updatedStorage)

      return updatedStorage.providers[providerId]
    } catch (error) {
      console.error(`❌ 更新 ${providerId} Provider 配置失败:`, error)
      throw error
    }
  }

  const deleteProvider = async (providerId: AIProvider) => {
    try {
      const newStorage = {
        ...storage,
        providers: {
          ...storage.providers,
          [providerId]: null
        }
      }

      if (storage.globalActiveProvider === providerId) {
        newStorage.globalActiveProvider = null
      }

      await storageInstance.set(STORAGE_KEYS.PROVIDER_STORAGE, newStorage)
      setStorage(newStorage)
    } catch (error) {
      console.error(`❌ 删除 ${providerId} Provider 失败:`, error)
      throw error
    }
  }

  const setActiveProvider = async (providerId: AIProvider | null) => {
    try {
      // 从storage中读取最新的数据，而不是依赖当前的状态
      const currentStorage = await storageInstance.get<GlobalStorage>(STORAGE_KEYS.PROVIDER_STORAGE)

      if (providerId && !currentStorage?.providers[providerId]) {
        throw new Error(`请先导入 ${providerId} 的 API Key`)
      }

      const updatedStorage = {
        ...currentStorage,
        globalActiveProvider: providerId
      }

      await storageInstance.set(STORAGE_KEYS.PROVIDER_STORAGE, updatedStorage)
      setStorage(updatedStorage)

      // 提供成功反馈
      if (providerId) {
        console.log(`✅ 已激活 ${providerId} Provider`)
      } else {
        console.log('✅ 已取消激活所有 Provider')
      }
    } catch (error) {
      console.error("❌ 切换Provider失败:", error)
      throw error
    }
  }

  const setActiveModel = async (providerId: AIProvider, modelId: string) => {
    try {
      const provider = storage.providers[providerId]
      if (!provider) {
        throw new Error(`请先配置 ${providerId} Provider`)
      }

      const updatedStorage = {
        ...storage,
        providers: {
          ...storage.providers,
          [providerId]: {
            ...provider,
            activeModel: modelId
          }
        }
      }

      await storageInstance.set(STORAGE_KEYS.PROVIDER_STORAGE, updatedStorage)
      setStorage(updatedStorage)

      // 获取模型名称用于反馈
      const providerConfig = getProviderById(providerId)
      const modelInfo = providerConfig?.models.find(m => m.id === modelId)
      console.log(`✅ 已切换到 ${providerId} 的 ${modelInfo?.name || modelId} 模型`)
    } catch (error) {
      console.error("❌ 切换模型失败:", error)
      throw error
    }
  }

  const getActiveProviderInfo = () => {
    if (!storage.globalActiveProvider) {
      return null
    }

    const providerData = storage.providers[storage.globalActiveProvider]
    if (!providerData) {
      return null
    }

    const providerConfig = getProviderById(storage.globalActiveProvider)
    const activeModel = providerConfig?.models.find(m => m.id === providerData.activeModel)

    return {
      provider: providerConfig,
      providerData,
      activeModel
    }
  }

  return {
    storage,
    loading,
    updateProviderStorage,
    deleteProvider,
    setActiveProvider,
    setActiveModel,
    getActiveProviderInfo
  }
}