// utils/balanceCheck.ts
import axios from 'axios';
import type { AIProvider } from '~/ai/types';

export const checkBalance = async (token: string, providerId: AIProvider = 'deepseek'): Promise<string | null> => {
  if (!token) {
    return null;
  }

  // 根据Provider选择不同的余额检查接口
  const getBalanceConfig = (providerId: AIProvider) => {
    switch (providerId) {
      case 'deepseek':
        return {
          url: 'https://api.deepseek.com/user/balance',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

      case 'glm':
        return {
          url: 'https://open.bigmodel.cn/api/paas/v4/me/balance',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

      case 'doubao':
        // 豆包可能没有公开的余额查询接口，返回检查状态的接口
        return {
          url: 'https://ark.cn-beijing.volces.com/api/v3/models',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

      default:
        return null;
    }
  };

  const config = getBalanceConfig(providerId);
  if (!config) {
    console.warn(`❌ 不支持的Provider: ${providerId}`);
    return '0';
  }

  try {
    console.log(`🔍 检查 ${providerId} 余额...`);
    const response = await axios({
      method: 'get',
      maxBodyLength: Infinity,
      ...config
    });

    // 根据不同Provider解析余额信息
    switch (providerId) {
      case 'deepseek':
        if (response.data?.is_available && response.data?.balance_infos?.length > 0) {
          const cnyBalanceInfo = response.data.balance_infos.find((info: any) => info.currency === 'CNY');
          return cnyBalanceInfo?.topped_up_balance || '0';
        }
        return '0';

      case 'glm':
        if (response.data?.data?.total_granted_amount) {
          // GLM返回的是额度信息，转换为可用余额
          const totalAmount = parseFloat(response.data.data.total_granted_amount);
          const usedAmount = parseFloat(response.data.data.total_used_amount || '0');
          const availableBalance = (totalAmount - usedAmount).toString();
          return availableBalance;
        }
        return '0';

      case 'doubao':
        // 豆包没有余额接口，如果能成功获取模型列表说明API Key有效
        if (response.data?.data?.length > 0) {
          console.log('✅ 豆包API Key有效，但无法查询余额');
          return '无法查询';
        }
        return '0';

      default:
        return '0';
    }

  } catch (error: any) {
    console.error(`❌ ${providerId} 余额检查失败:`, {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      message: error?.message
    });

    // 如果是401错误，说明API Key无效
    if (error?.response?.status === 401) {
      return 'API Key无效';
    }

    return '0';
  }
};