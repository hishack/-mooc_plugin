import OpenAI from 'openai'
import { getModelByAlias, isValidAlias } from './models'
import type { ClientInstance, TokenInfo } from './types'

/**
 * Create OpenAI client instance based on alias and token
 * @param alias - Model alias (e.g., 'v1', 'R1', 'glm4', 'doubao1')
 * @param token - API token for the provider
 * @returns { client, model } object or null if alias is invalid
 */
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
      // Add any default configuration needed
      dangerouslyAllowBrowser: true // Allow usage in browser environment
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

/**
 * Create OpenAI client from token info
 * @param tokenInfo - Token information from local storage
 * @returns { client, model } object or null if creation fails
 */
export function createClientFromTokenInfo(tokenInfo: TokenInfo | null): ClientInstance | null {
  if (!tokenInfo) {
    console.error('Token info is null')
    return null
  }

  return createAIClient(tokenInfo.model, tokenInfo.token)
}

/**
 * Validate client connection (optional helper)
 * @param clientInstance - Client instance to validate
 * @returns Promise that resolves to true if connection is valid
 */
export async function validateClientConnection(clientInstance: ClientInstance): Promise<boolean> {
  if (!clientInstance) {
    return false
  }

  try {
    // Create a minimal test request to validate the connection
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