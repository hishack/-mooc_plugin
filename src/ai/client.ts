import OpenAI from 'openai'
import { getModelByAlias, isValidAlias } from './models'
import type { ClientInstance, TokenInfo } from './types'

export interface ValidationResult {
  success: boolean
  message: string
  details?: any
}

export function createAIClient(alias: string, token: string): ClientInstance | null {
  if (!token || !isValidAlias(alias)) {
    console.error('Invalid token or alias:', { alias, hasToken: !!token })
    return null
  }

  const modelConfig = getModelByAlias(alias)
  if (!modelConfig) {
    console.error('Model configuration not found for alias:', alias)
    return null
  }

  try {
    const client = new OpenAI({
      baseURL: modelConfig.baseURL,
      apiKey: token,
      dangerouslyAllowBrowser: true
    })

    return {
      client,
      model: modelConfig.model
    }
  } catch (error) {
    console.error('Failed to create OpenAI client:', error)
    return null
  }
}

export function createClientFromTokenInfo(tokenInfo: TokenInfo | null): ClientInstance | null {
  if (!tokenInfo) {
    console.error('Token info is null')
    return null
  }

  return createAIClient(tokenInfo.model, tokenInfo.token)
}

export async function validateApiKey(alias: string, token: string): Promise<ValidationResult> {
  console.log('🔍 开始验证API Key...', { alias, tokenLength: token?.length })

  if (!token || !isValidAlias(alias)) {
    console.log('❌ 验证失败: 无效的token或alias')
    return {
      success: false,
      message: 'API Key格式无效或模型不支持'
    }
  }

  const clientInstance = createAIClient(alias, token)
  if (!clientInstance) {
    console.log('❌ 验证失败: 无法创建客户端')
    return {
      success: false,
      message: '无法创建API客户端，请检查模型配置'
    }
  }

  try {
    console.log('📡 发送测试请求到API...')
    const testResponse = await clientInstance.client.chat.completions.create({
      messages: [{ role: 'user', content: 'test' }],
      model: clientInstance.model,
      max_tokens: 1,
      temperature: 0.1
    })

    console.log('✅ API响应成功:', {
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
      message: 'API Key验证成功',
      details: {
        model: testResponse.model,
        usage: testResponse.usage,
        responseId: testResponse.id,
        responseContent: testResponse.choices[0]?.message?.content
      }
    }

  } catch (error: any) {
    console.log('❌ API验证失败:', {
      name: error?.name,
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
      code: error?.code,
      type: error?.type
    })

    let errorMessage = 'API Key验证失败'

    if (error?.status === 401) {
      errorMessage = 'API Key无效，请检查是否正确'
    } else if (error?.status === 403) {
      errorMessage = 'API Key无权限访问此模型'
    } else if (error?.status === 404) {
      errorMessage = '模型不存在或名称错误'
    } else if (error?.status === 429) {
      errorMessage = 'API调用频率过高或余额不足'
    } else if (error?.code === 'insufficient_quota') {
      errorMessage = 'API余额不足，请充值后重试'
    } else if (error?.message) {
      errorMessage = `API错误: ${error.message}`
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