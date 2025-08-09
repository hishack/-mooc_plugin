import { useEffect, useState } from 'react';
import { Storage } from "@plasmohq/storage";
import { checkBalance } from '~utils/balanceCheck';

import type { Model, TokenInfo } from '~types/type';

const STORAGE_KEYS = {
  TOKEN: "token"
} as const;

const DEFAULT_VALUES = {
  TOKEN: '',
  TOKEN_REST_MONEY: '0',
  ESTABLISH_TIME: '',
  MODEL: 'v1' as Model,
} as const;

export function useTokenInfo() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    token: DEFAULT_VALUES.TOKEN,
    token_rest_money: DEFAULT_VALUES.TOKEN_REST_MONEY,
    establish_time: DEFAULT_VALUES.ESTABLISH_TIME,
    model: DEFAULT_VALUES.MODEL
  });

  const [loadingState, setLoadingState] = useState(true);
  const storage = new Storage({ area: "local" });

  useEffect(() => {
    const initializeTokenInfo = async () => {
      try {
        const localResult = await storage.get<TokenInfo>(STORAGE_KEYS.TOKEN);
        const loadedInfo = localResult ? {
          ...localResult,
          model: localResult.model || DEFAULT_VALUES.MODEL,
        } : {
          token: DEFAULT_VALUES.TOKEN,
          token_rest_money: DEFAULT_VALUES.TOKEN_REST_MONEY,
          establish_time: DEFAULT_VALUES.ESTABLISH_TIME,
          model: DEFAULT_VALUES.MODEL
        };
        
        setTokenInfo(loadedInfo);
        setLoadingState(false);

        if (loadedInfo.token) {
          const balance = await checkBalance(loadedInfo.token);
          if (balance !== loadedInfo.token_rest_money) {
            const updatedInfo = { ...loadedInfo, token_rest_money: balance };
            setTokenInfo(updatedInfo);
            await storage.set(STORAGE_KEYS.TOKEN, updatedInfo);
          }
        }
      } catch (error) {
        console.error("加载失败:", error);
        setLoadingState(false);
      }
    };
    initializeTokenInfo();
  }, []);

  const updateTokenInfo = async (newTokenInfo: Partial<TokenInfo>) => {
    try {
      const updatedInfo = {
        ...tokenInfo,
        ...newTokenInfo,
      };
      await storage.set(STORAGE_KEYS.TOKEN, updatedInfo);
      setTokenInfo(updatedInfo);
    } catch (error) {
      console.error("更新失败:", error);
      throw error;
    }
  };

  const clearTokenInfo = async () => {
    const clearedInfo = {
      token: DEFAULT_VALUES.TOKEN,
      token_rest_money: DEFAULT_VALUES.TOKEN_REST_MONEY,
      establish_time: DEFAULT_VALUES.ESTABLISH_TIME,
      model: DEFAULT_VALUES.MODEL,
    };
    await storage.set(STORAGE_KEYS.TOKEN, clearedInfo);
    setTokenInfo(clearedInfo);
  };

  return {
    tokenInfo,
    loadingState,
    updateTokenInfo,
    clearTokenInfo
  };
}