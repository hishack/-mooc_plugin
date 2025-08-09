interface RequestBody {
  answers: QuestionsAnswer[];
}

interface ResponseBody {
  messages: string; 
}
export type RequestBodyQue = {
  id: number
}
 
export type ResponseBodyQue = {
  questions: string[]
}
interface AppearanceSettings {
  theme: Theme
}

interface SystemSettings {
  notifications: boolean
  syncInterval: number
}



export type Theme = "system" | "light" | "dark"

export interface UISettings {
  activeTab: string
}

export interface UseThemeProps {
  theme: Theme
  onThemeChange?: (theme: Theme) => void
}
type Model = 'v1' | 'R1';

interface TokenInfo {
  token: string;
  token_rest_money: string;
  establish_time: string;
  model: Model;
}