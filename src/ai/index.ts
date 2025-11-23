import { Storage } from '@plasmohq/storage'
import type { ApiPayload, TokenInfo, AIResponse } from './types'
import { createClientFromTokenInfo } from './client'

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'token'
} as const

/**
 * Main API function for answering questions using AI models
 * This is the single entry point for the AI calling system
 *
 * @param payload - Object containing the questions string
 * @returns Promise<string> - Pure JSON string response or null on failure
 */
export async function apiAnswer(payload: ApiPayload): Promise<string | null> {
  try {
    // 1. Read current user selected model and token from local storage
    const storage = new Storage({ area: 'local' })
    const tokenInfo = await storage.get<TokenInfo>(STORAGE_KEYS.TOKEN)

    if (!tokenInfo || !tokenInfo.token) {
      console.error('No valid token found in storage')
      return null
    }

    // 2. Create client based on the stored model configuration
    const clientInstance = createClientFromTokenInfo(tokenInfo)

    if (!clientInstance) {
      console.error('Failed to create AI client')
      return null
    }

    // 3. Prepare the prompt with the specified format requirement
    const prompt = `${payload.questions}, ����<�� JSON
    [{"id":1,"answer":["B"]},{"id":2,"answer":["A","C"]}]
    ������Y��`

    // 4. Send chat.completions request
    const completion = await clientInstance.client.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: clientInstance.model,
      temperature: 0.1, // Low temperature for consistent output
      max_tokens: 4000 // Adjust based on expected response size
    })

    // 5. Return pure JSON string
    const response = completion.choices[0]?.message?.content

    if (!response) {
      console.error('No response content received from AI model')
      return null
    }

    // Clean up the response to ensure it's a valid JSON string
    const cleanedResponse = response.trim()

    // Validate if the response looks like JSON (basic check)
    if (!cleanedResponse.startsWith('[') && !cleanedResponse.startsWith('{')) {
      console.error('Response does not appear to be in JSON format:', cleanedResponse)
      return null
    }

    return cleanedResponse

  } catch (error) {
    console.error('AI API call failed:', error)
    return null
  }
}

/**
 * Get current token information from storage
 * @returns Promise<TokenInfo | null> - Current token configuration or null
 */
export async function getCurrentTokenInfo(): Promise<TokenInfo | null> {
  const storage = new Storage({ area: 'local' })
  return await storage.get<TokenInfo>(STORAGE_KEYS.TOKEN)
}

/**
 * Save token information to storage
 * @param tokenInfo - Token information to save
 */
export async function saveTokenInfo(tokenInfo: TokenInfo): Promise<void> {
  const storage = new Storage({ area: 'local' })
  await storage.set(STORAGE_KEYS.TOKEN, tokenInfo)
}

/**
 * Clear token information from storage
 */
export async function clearTokenInfo(): Promise<void> {
  const storage = new Storage({ area: 'local' })
  await storage.remove(STORAGE_KEYS.TOKEN)
}

/**
 * Parse AI response to typed object
 * @param jsonResponse - JSON string from AI response
 * @returns Parsed AIResponse array or null
 */
export function parseAIResponse(jsonResponse: string): AIResponse[] | null {
  try {
    const parsed = JSON.parse(jsonResponse)
    // Ensure the response is an array
    return Array.isArray(parsed) ? parsed : null
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    return null
  }
}

// Export all types and models for external use if needed
export * from './types'
export * from './models'
export * from './client'