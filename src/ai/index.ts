import { Storage } from '@plasmohq/storage'
import type { ApiPayload, AIResponse, GlobalStorage } from './types/index'
import { createAIClient } from './client'
import { getProviderById } from './providers/index'

const STORAGE_KEYS = {
  PROVIDER_STORAGE: 'provider_storage'
} as const

export async function apiAnswer(payload: ApiPayload): Promise<string | null> {
  try {
    console.log('🚀 开始AI答题流程...')
    const storage = new Storage({ area: 'local' })
    const providerStorage = await storage.get<GlobalStorage>(STORAGE_KEYS.PROVIDER_STORAGE)

    if (!providerStorage) {
      console.error('❌ 未找到Provider配置，请先配置API Key')
      return null
    }

    if (!providerStorage.globalActiveProvider) {
      console.error('❌ 未激活任何Provider，请先在设置中激活一个Provider')
      return null
    }

    const activeProviderId = providerStorage.globalActiveProvider
    const providerData = providerStorage.providers[activeProviderId]

    if (!providerData) {
      console.error(`❌ Provider ${activeProviderId} 配置不存在，请重新导入API Key`)
      return null
    }

    if (!providerData.apiKey) {
      console.error(`❌ Provider ${activeProviderId} API Key为空，请重新导入`)
      return null
    }

    console.log(`✅ 使用Provider: ${activeProviderId}, 模型: ${providerData.activeModel}`)

    const providerConfig = getProviderById(activeProviderId)
    if (!providerConfig) {
      console.error(`❌ Provider配置文件不存在: ${activeProviderId}`)
      return null
    }

    const clientInstance = createAIClient(activeProviderId, providerData.apiKey, providerData.activeModel)

    if (!clientInstance) {
      console.error(`❌ 无法创建AI客户端: ${activeProviderId}`)
      return null
    }

    console.log('📝 构建答题提示词...')
    const prompt = `${payload.questions}, 请以这种格式只输出 JSON：
    [{"id":1,"answer":["B"]},{"id":2,"answer":["A","C"]}]
    不能解释、不能输出多余内容`

    console.log('🤖 开始调用AI模型...')
    const completion = await clientInstance.client.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: clientInstance.model,
      temperature: 0.1,
      max_tokens: 4000
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      console.error('❌ AI模型返回了空响应')
      return null
    }

    console.log('📋 AI响应长度:', response.length)
    const cleanedResponse = response.trim()

    // 尝试提取JSON部分，增强容错性
    const extractJSON = (text: string): string | null => {
      // 如果整个文本就是JSON，直接返回
      if (text.startsWith('[') && text.endsWith(']')) return text
      if (text.startsWith('{') && text.endsWith('}')) return text

      // 尝试提取JSON部分
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
      if (jsonMatch) {
        console.log('🔧 从响应中提取JSON部分:', jsonMatch[0].substring(0, 100) + '...')
        return jsonMatch[0]
      }

      return null
    }

    const jsonContent = extractJSON(cleanedResponse)

    if (!jsonContent) {
      console.error('❌ 响应中未找到有效的JSON格式:', cleanedResponse.substring(0, 200) + '...')
      return null
    }

    console.log('✅ 成功提取JSON响应')
    return jsonContent

  } catch (error: any) {
    console.error('❌ AI API调用失败:', {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      code: error?.code,
      type: error?.type
    })

    // 根据错误类型提供更具体的错误信息
    if (error?.response?.status === 401) {
      console.error('❌ API Key无效或已过期，请检查配置')
    } else if (error?.response?.status === 403) {
      console.error('❌ API Key无权限访问此模型')
    } else if (error?.response?.status === 429) {
      console.error('❌ API调用频率过高或余额不足')
    } else if (error?.code === 'insufficient_quota') {
      console.error('❌ API余额不足，请充值后重试')
    } else if (error?.message?.includes('network')) {
      console.error('❌ 网络连接失败，请检查网络设置')
    }

    return null
  }
}

export async function getCurrentTokenInfo() {
  const storage = new Storage({ area: 'local' })
  const providerStorage = await storage.get<GlobalStorage>(STORAGE_KEYS.PROVIDER_STORAGE)

  if (!providerStorage || !providerStorage.globalActiveProvider || !providerStorage.providers[providerStorage.globalActiveProvider]) {
    return null
  }

  const activeProvider = providerStorage.providers[providerStorage.globalActiveProvider]
  if (!activeProvider) return null

  // 返回兼容的TokenInfo格式
  return {
    token: activeProvider.apiKey,
    model: activeProvider.activeModel,
    token_rest_money: activeProvider.token_rest_money,
    establish_time: activeProvider.establish_time
  }
}

export async function saveTokenInfo(tokenInfo: any) {
  const storage = new Storage({ area: 'local' })
  const providerStorage: GlobalStorage = await storage.get(STORAGE_KEYS.PROVIDER_STORAGE) || {
    providers: {
      deepseek: null,
      glm: null,
      doubao: null
    },
    globalActiveProvider: null
  }

  // 基于模型别名确定provider
  let providerId: 'deepseek' | 'glm' | 'doubao'
  if (tokenInfo.model === 'v1' || tokenInfo.model === 'R1') {
    providerId = 'deepseek'
  } else if (tokenInfo.model === 'glm4') {
    providerId = 'glm'
  } else if (tokenInfo.model === 'doubao1') {
    providerId = 'doubao'
  } else {
    providerId = 'deepseek' // 默认
  }

  providerStorage.providers[providerId] = {
    provider: providerId,
    apiKey: tokenInfo.token,
    enabledModels: [tokenInfo.model],
    activeModel: tokenInfo.model,
    token_rest_money: tokenInfo.token_rest_money,
    establish_time: tokenInfo.establish_time
  }
  providerStorage.globalActiveProvider = providerId

  await storage.set(STORAGE_KEYS.PROVIDER_STORAGE, providerStorage)
}

export async function clearTokenInfo() {
  const storage = new Storage({ area: 'local' })
  await storage.remove(STORAGE_KEYS.PROVIDER_STORAGE)
}

export function parseAIResponse(jsonResponse: string): AIResponse[] | null {
  try {
    const parsed = JSON.parse(jsonResponse)
    return Array.isArray(parsed) ? parsed : null
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    return null
  }
}

// 导出所有类型和providers
export * from './types/index'
export * from './providers/index'
export * from './client'