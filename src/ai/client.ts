import OpenAI from 'openai'
import { getModelByAlias, isValidAlias } from './models'
import type { ClientInstance, TokenInfo } from './types'

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