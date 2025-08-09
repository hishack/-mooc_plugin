import { useEffect, useState } from 'react'
import { Storage } from "@plasmohq/storage"

type Theme = 'system' | 'light' | 'dark'
import type{ AppearanceSettings, SystemSettings, UISettings } from "~types/type"



// Define default fallback values directly
const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: 'system'
}

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  notifications: true,
  syncInterval: 15
}

const DEFAULT_UI_SETTINGS: UISettings = {
  activeTab: 'home'
}

// Keys for storage
const APPEARANCE_STORAGE_KEY = 'appearanceSettings'
const SYSTEM_STORAGE_KEY = 'systemSettings'
const UI_STORAGE_KEY = 'uiSettings'

export function useSettings() {
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE_SETTINGS)
  const [system, setSystem] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS)
  const [ui, setUI] = useState<UISettings>(DEFAULT_UI_SETTINGS)
  const [loading, setLoading] = useState(true)

  // 1. 创建 Storage 实例，确保它在整个 Hook 生命周期中保持一致
  const storage = new Storage({
    area: "local"
  })

  // Load settings from storage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // 2. 使用 storage.get(key) 方法直接获取单个键的值
        const result1 = await storage.get<AppearanceSettings>(APPEARANCE_STORAGE_KEY);
        const result2 = await storage.get<SystemSettings>(SYSTEM_STORAGE_KEY);
        const result3 = await storage.get<UISettings>(UI_STORAGE_KEY);

        // 3. 直接使用获取到的值，不再需要通过键名访问
        setAppearance(result1 ?? DEFAULT_APPEARANCE_SETTINGS);
        setSystem(result2 ?? DEFAULT_SYSTEM_SETTINGS);
        setUI(result3 ?? DEFAULT_UI_SETTINGS);
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [])

  // Update appearance settings and save to storage
  const updateAppearance = async (updates: Partial<AppearanceSettings>) => {
    const newSettings = { ...appearance, ...updates }
    setAppearance(newSettings)
    try {
      // 4. 使用 storage.set(key, value) 方法保存键值对
      await storage.set(APPEARANCE_STORAGE_KEY, newSettings);
    } catch (error) {
      console.error('Failed to save appearance settings:', error);
    }
  }

  // Update system settings and save to storage
  const updateSystem = async (updates: Partial<SystemSettings>) => {
    const newSettings = { ...system, ...updates }
    setSystem(newSettings)
    try {
      // 5. 使用 storage.set(key, value) 方法保存键值对
      await storage.set(SYSTEM_STORAGE_KEY, newSettings);
    } catch (error) {
      console.error('Failed to save system settings:', error);
    }
  }

  // Update UI settings and save to storage
  const updateUI = async (updates: Partial<UISettings>) => {
    const newSettings = { ...ui, ...updates }
    setUI(newSettings)
    try {
      // 6. 使用 storage.set(key, value) 方法保存键值对
      await storage.set(UI_STORAGE_KEY, newSettings);
    } catch (error) {
      console.error('Failed to save UI settings:', error);
    }
  }

  // Reset all settings to their default values
  const resetSettings = async () => {
    try {
      // 7. 使用 storage.remove(key) 方法移除单个键
      await storage.remove(APPEARANCE_STORAGE_KEY)    
      await storage.remove(SYSTEM_STORAGE_KEY)
      await storage.remove(UI_STORAGE_KEY)

      // Reset state to default values
      setAppearance(DEFAULT_APPEARANCE_SETTINGS)
      setSystem(DEFAULT_SYSTEM_SETTINGS)
      setUI(DEFAULT_UI_SETTINGS)
    } catch (error) {
      console.error('Failed to reset settings:', error)
    }
  }

  return {
    appearance,
    system,
    ui,
    loading,
    updateAppearance,
    updateSystem,
    updateUI,
    resetSettings
  }
}