import OpenAI from 'openai'
import { getProviderById, findModelByAlias } from './providers'
import type { ClientInstance, ValidationResult, AIProvider } from './types/index'

export function createAIClient(providerId: AIProvider, apiKey: string, modelId?: string): ClientInstance | null {
  if (!apiKey) {
    console.error('API Key is required')
    return null
  }

  const provider = getProviderById(providerId)
  if (!provider) {
    console.error('Provider not found:', providerId)
    return null
  }

  try {
    const client = new OpenAI({
      baseURL: provider.baseURL,
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    })

    return {
      client,
      model: modelId || provider.models[0]?.id || ''
    }
  } catch (error) {
    console.error('Failed to create OpenAI client:', error)
    return null
  }
}

export function createClientByAlias(alias: string, apiKey: string): ClientInstance | null {
  const modelInfo = findModelByAlias(alias)
  if (!modelInfo) {
    console.error('Model not found for alias:', alias)
    return null
  }

  return createAIClient(modelInfo.provider.id, apiKey, modelInfo.model.id)
}

export async function validateProviderApiKey(providerId: AIProvider, apiKey: string): Promise<ValidationResult> {
  console.log('🔍 开始验证Provider API Key...', { providerId, tokenLength: apiKey?.length })

  if (!apiKey) {
    console.log('❌ 验证失败: API Key为空')
    return {
      success: false,
      message: 'API Key不能为空'
    }
  }

  const provider = getProviderById(providerId)
  if (!provider) {
    console.log('❌ 验证失败: Provider不存在')
    return {
      success: false,
      message: 'Provider不存在'
    }
  }

  const clientInstance = createAIClient(providerId, apiKey, provider.models[0].id)
  if (!clientInstance) {
    console.log('❌ 验证失败: 无法创建客户端')
    return {
      success: false,
      message: '无法创建API客户端，请检查配置'
    }
  }

  try {
    console.log('📡 发送测试请求到Provider...')
    const testResponse = await clientInstance.client.chat.completions.create({
      messages: [{ role: 'user', content: 'test' }],
      model: clientInstance.model,
      max_tokens: 1,
      temperature: 0.1
    })

    console.log('✅ Provider API响应成功:', {
      provider: provider.name,
      id: testResponse.id,
      created: testResponse.created,
      model: testResponse.model,
      usage: testResponse.usage,
      choices: testResponse.choices?.length,
      response: testResponse.choices?.[0]?.message?.content
    })

    if (!testResponse || !testResponse.choices || testResponse.choices.length === 0) {
      return {
        success: false,
        message: 'API返回了空响应',
        details: testResponse
      }
    }

    return {
      success: true,
      message: `${provider.name} API Key验证成功`,
      details: {
        provider: provider.name,
        model: testResponse.model,
        usage: testResponse.usage,
        responseId: testResponse.id,
        responseContent: testResponse.choices[0]?.message?.content,
        availableModels: provider.models
      }
    }

  } catch (error: any) {
    console.log('❌ Provider API验证失败:', {
      provider: provider.name,
      name: error?.name,
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
      code: error?.code,
      type: error?.type
    })

    let errorMessage = `${provider.name} API Key验证失败`

    if (error?.status === 401) {
      errorMessage = `${provider.name} API Key无效，请检查是否正确`
    } else if (error?.status === 403) {
      errorMessage = `API Key无权限访问${provider.name}`
    } else if (error?.status === 404) {
      errorMessage = `模型不存在或${provider.name}服务地址错误`
    } else if (error?.status === 429) {
      errorMessage = 'API调用频率过高或余额不足'
    } else if (error?.code === 'insufficient_quota') {
      errorMessage = 'API余额不足，请充值后重试'
    } else if (error?.message) {
      errorMessage = `${provider.name} API错误: ${error.message}`
    }

    return {
      success: false,
      message: errorMessage,
      details: {
        status: error?.status,
        code: error?.code,
        originalError: error
      }
    }
  }
}

export async function validateClientConnection(clientInstance: ClientInstance): Promise<boolean> {
  if (!clientInstance) {
    return false
  }

  try {
    const testResponse = await clientInstance.client.chat.completions.create({
      messages: [{ role: 'user', content: 'test' }],
      model: clientInstance.model,
      max_tokens: 1
    })

    return !!testResponse
  } catch (error) {
    console.error('Client validation failed:', error)
    return false
  }
}

// 兼容性函数 - 保持向后兼容
export async function validateApiKey(alias: string, token: string): Promise<ValidationResult> {
  const modelInfo = findModelByAlias(alias)
  if (!modelInfo) {
    return {
      success: false,
      message: '模型别名不存在'
    }
  }

  return validateProviderApiKey(modelInfo.provider.id, token)
}