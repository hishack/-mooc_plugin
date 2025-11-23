import { useEffect, useState } from 'react'
import { Storage } from "@plasmohq/storage"
import { checkBalance } from '~utils/balanceCheck'
import type { TokenInfo } from '~/ai/types'

const STORAGE_KEYS = {
  MULTI_TOKENS: 'multi_tokens'
} as const

export interface MultiTokenStorage {
  tokens: Record<string, TokenInfo>
  activeModel: string | null
}

export function useMultiTokenInfo() {
  const [storage, setStorage] = useState<MultiTokenStorage>({
    tokens: {},
    activeModel: null
  })
  const [loading, setLoading] = useState(true)
  const storageInstance = new Storage({ area: "local" })

  useEffect(() => {
    const initializeMultiTokens = async () => {
      try {
        const storedData = await storageInstance.get<MultiTokenStorage>(STORAGE_KEYS.MULTI_TOKENS)

        if (storedData) {
          setStorage(storedData)
        } else {
          // Migrate from old single token system
          const oldToken = await storageInstance.get('token')
          if (oldToken) {
            const migratedStorage: MultiTokenStorage = {
              tokens: {
                [oldToken.model]: oldToken
              },
              activeModel: oldToken.model
            }
            await storageInstance.set(STORAGE_KEYS.MULTI_TOKENS, migratedStorage)
            setStorage(migratedStorage)
            // Clear old storage
            await storageInstance.remove('token')
          }
        }

        setLoading(false)
      } catch (error) {
        console.error("Failed to load multi token info:", error)
        setLoading(false)
      }
    }

    initializeMultiTokens()
  }, [])

  const updateTokenInfo = async (modelAlias: string, tokenInfo: Partial<TokenInfo>) => {
    try {
      const updatedStorage = {
        ...storage,
        tokens: {
          ...storage.tokens,
          [modelAlias]: {
            ...storage.tokens[modelAlias],
            ...tokenInfo,
            model: modelAlias,
            establish_time: tokenInfo.establish_time || new Date().toISOString()
          }
        }
      }

      await storageInstance.set(STORAGE_KEYS.MULTI_TOKENS, updatedStorage)
      setStorage(updatedStorage)

      // Check balance if token provided
      if (tokenInfo.token) {
        const balance = await checkBalance(tokenInfo.token)
        const finalStorage = {
          ...updatedStorage,
          tokens: {
            ...updatedStorage.tokens,
            [modelAlias]: {
              ...updatedStorage.tokens[modelAlias],
              token_rest_money: balance
            }
          }
        }
        await storageInstance.set(STORAGE_KEYS.MULTI_TOKENS, finalStorage)
        setStorage(finalStorage)
      }
    } catch (error) {
      console.error("Failed to update token info:", error)
      throw error
    }
  }

  const deleteTokenInfo = async (modelAlias: string) => {
    try {
      const newTokens = { ...storage.tokens }
      delete newTokens[modelAlias]

      const newActiveModel = storage.activeModel === modelAlias ? null : storage.activeModel

      const updatedStorage = {
        tokens: newTokens,
        activeModel: newActiveModel
      }

      await storageInstance.set(STORAGE_KEYS.MULTI_TOKENS, updatedStorage)
      setStorage(updatedStorage)
    } catch (error) {
      console.error("Failed to delete token info:", error)
      throw error
    }
  }

  const setActiveModel = async (modelAlias: string | null) => {
    try {
      if (modelAlias && !storage.tokens[modelAlias]) {
        throw new Error(`No token info found for model: ${modelAlias}`)
      }

      const updatedStorage = {
        ...storage,
        activeModel: modelAlias
      }

      await storageInstance.set(STORAGE_KEYS.MULTI_TOKENS, updatedStorage)
      setStorage(updatedStorage)
    } catch (error) {
      console.error("Failed to set active model:", error)
      throw error
    }
  }

  const getActiveTokenInfo = (): TokenInfo | null => {
    if (!storage.activeModel || !storage.tokens[storage.activeModel]) {
      return null
    }
    return storage.tokens[storage.activeModel]
  }

  return {
    storage,
    loading,
    updateTokenInfo,
    deleteTokenInfo,
    setActiveModel,
    getActiveTokenInfo
  }
}