import { Storage } from '@plasmohq/storage'
import type { ApiPayload, TokenInfo, AIResponse } from './types'
import { createClientFromTokenInfo } from './client'
import type { MultiTokenStorage } from '../hooks/use-multiTokenInfo'

const STORAGE_KEYS = {
  MULTI_TOKENS: 'multi_tokens'
} as const

export async function apiAnswer(payload: ApiPayload): Promise<string | null> {
  try {
    const storage = new Storage({ area: 'local' })
    const multiTokenStorage = await storage.get<MultiTokenStorage>(STORAGE_KEYS.MULTI_TOKENS)

    if (!multiTokenStorage || !multiTokenStorage.activeModel || !multiTokenStorage.tokens[multiTokenStorage.activeModel]) {
      console.error('No active model or token found in storage')
      return null
    }

    const tokenInfo = multiTokenStorage.tokens[multiTokenStorage.activeModel]

    if (!tokenInfo.token) {
      console.error('No valid token found for active model')
      return null
    }

    const clientInstance = createClientFromTokenInfo(tokenInfo)

    if (!clientInstance) {
      console.error('Failed to create AI client')
      return null
    }

    const prompt = `${payload.questions}, 请以这种格式只输出 JSON：
    [{"id":1,"answer":["B"]},{"id":2,"answer":["A","C"]}]
    不能解释、不能输出多余内容`

    const completion = await clientInstance.client.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: clientInstance.model,
      temperature: 0.1,
      max_tokens: 4000
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      console.error('No response content received from AI model')
      return null
    }

    const cleanedResponse = response.trim()

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

export async function getCurrentTokenInfo(): Promise<TokenInfo | null> {
  const storage = new Storage({ area: 'local' })
  const multiTokenStorage = await storage.get<MultiTokenStorage>(STORAGE_KEYS.MULTI_TOKENS)

  if (!multiTokenStorage || !multiTokenStorage.activeModel || !multiTokenStorage.tokens[multiTokenStorage.activeModel]) {
    return null
  }

  return multiTokenStorage.tokens[multiTokenStorage.activeModel]
}

export async function saveTokenInfo(tokenInfo: TokenInfo): Promise<void> {
  const storage = new Storage({ area: 'local' })
  const multiTokenStorage: MultiTokenStorage = await storage.get(STORAGE_KEYS.MULTI_TOKENS) || {
    tokens: {},
    activeModel: null
  }

  multiTokenStorage.tokens[tokenInfo.model] = tokenInfo
  multiTokenStorage.activeModel = tokenInfo.model

  await storage.set(STORAGE_KEYS.MULTI_TOKENS, multiTokenStorage)
}

export async function clearTokenInfo(): Promise<void> {
  const storage = new Storage({ area: 'local' })
  await storage.remove(STORAGE_KEYS.MULTI_TOKENS)
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

export * from './types'
export * from './models'
export * from './client'