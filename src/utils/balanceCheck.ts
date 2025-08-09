// utils/balanceCheck.ts
import axios from 'axios';

export const checkBalance = async (token: string) => {
  if (!token) {
    ;
    return null;
  }
  const authorization = `Bearer ${token}`;
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://api.deepseek.com/user/balance',
    headers: {
      'Accept': 'application/json',
      'Authorization': authorization
    }
  };
  try {
    const response = await axios(config);
    if (response.data && response.data.is_available && response.data.balance_infos.length > 0) {
      const cnyBalanceInfo = response.data.balance_infos.find((info: any) => info.currency === 'CNY');
      return cnyBalanceInfo ? cnyBalanceInfo.topped_up_balance : '0';
    }
    return '0';
  } catch (error) {
    console.error("余额检查失败:", error);
    return '0';
  }
};