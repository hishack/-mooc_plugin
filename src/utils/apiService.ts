import OpenAI from "openai";
import { Storage } from "@plasmohq/storage";

interface TokenInfo {
  token: string;
  token_rest_money: string;
  establish_time: string;
  model: "v1" | "R1";
}

const STORAGE_KEYS = {
  TOKEN: "token"
} as const;

interface ApiPayload {
  questions: string;
}

export async function apiAnswer(payload: ApiPayload) {
  const storage = new Storage({ area: "local" });

  const localResult = await storage.get<TokenInfo>(STORAGE_KEYS.TOKEN);
  const token = localResult?.token || '';
  const modelChoice = localResult?.model || 'v1';

  if (!token) {
    return null;
  }

  const modelMap = {
    'v1': 'deepseek-chat',
    'R1': 'deepseek-reasoner'
  };

  const selectedModel = modelMap[modelChoice] || 'deepseek-chat';

  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: token
  });

  const prompt = `${payload.questions},请以这种格式只输出答案,只输出答案,填空题不同选项都以逗号隔开:[{"id": 1, "answer": ["B"]},{"id": 2, "answer": ["A", "C"]}]`;


  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: selectedModel,
    });

    return completion.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("API调用失败:", error);
    return null;
  }
}