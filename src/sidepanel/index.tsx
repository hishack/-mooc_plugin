import "~style.css"

import { Toaster } from "@/components/ui/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSettings } from "@/hooks/use-settings"
import { useTheme } from "@/hooks/use-theme"
import { Heart, House, Settings as SettingsIcon, User } from "lucide-react"

import { Home } from "./Home"
import { Profile } from "./Profile"
import { Settings as AppSettings } from "./Settings"

export default function App() {
  const { appearance, updateAppearance, ui, updateUI, loading } = useSettings()

  useTheme({
    theme: appearance.theme,
    onThemeChange: (newTheme) => updateAppearance({ theme: newTheme })
  })

  const handleTabChange = (value: string) => {
    updateUI({ activeTab: value })
  }

  if (loading) return null

  return (
    <>
      <Toaster position="top-right" />
      <div className="flex flex-col h-screen bg-background text-foreground transition-colors">
        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Mooc 助手</h1>
              <p className="text-sm text-muted-foreground">
                Author: <span>@小清新</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs
            value={ui.activeTab}
            onValueChange={handleTabChange}
            className="h-full flex flex-col gap-0">
            <TabsList className="h-auto rounded-none border-b bg-transparent p-0 w-full flex-shrink-0">
              <TabsTrigger value="home" className="tab-trigger">
                <House className="h-4 w-4" />
                首页
              </TabsTrigger>
              <TabsTrigger value="profile" className="tab-trigger">
                <User className="h-4 w-4" />
                个人资料
              </TabsTrigger>
              <TabsTrigger value="settings" className="tab-trigger">
                <SettingsIcon className="h-4 w-4" />
                设置
              </TabsTrigger>
            </TabsList>

            <TabsContent value="home" className="flex-1 overflow-y-auto">
              <Home />
            </TabsContent>
            <TabsContent value="profile" className="flex-1 overflow-y-auto">
              <Profile />
            </TabsContent>
            <TabsContent value="settings" className="flex-1 overflow-y-auto">
              <AppSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
