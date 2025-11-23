import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useSettings } from "@/hooks/use-settings"
import { useTheme } from "@/hooks/use-theme"
import { Monitor, Moon, Sun, Bot } from "lucide-react"
import { ProviderTable } from "~/components/provider-management/ProviderTable"
import { useProviderStorage } from "~/hooks/use-providerStorage"
import { successToast, errorToast } from "~components/alter"
import { Loader2 } from "lucide-react"

export function Settings() {
  const { appearance, loading, updateAppearance } = useSettings()
  const { storage, loading: tokenLoading, updateProviderStorage, deleteProvider, setActiveProvider, setActiveModel, getActiveProviderInfo } = useProviderStorage()

  const { resolvedTheme, setTheme } = useTheme({
    theme: appearance.theme,
    onThemeChange: (theme) => updateAppearance({ theme })
  })

  const themeOptions = [
    { value: "system", label: "系统", icon: Monitor },
    { value: "light", label: "浅色", icon: Sun },
    { value: "dark", label: "深色", icon: Moon }
  ] as const

  const handleProviderSetActive = async (providerId: any) => {
    try {
      await setActiveProvider(providerId)
      successToast(providerId ? `已切换到 ${providerId}` : "已取消激活Provider")
    } catch (error) {
      errorToast("切换Provider失败")
      console.error(error)
    }
  }

  const handleProviderUpdate = async (providerId: any, data: any) => {
    try {
      await updateProviderStorage(providerId, data)
      successToast("API Key更新成功")
    } catch (error) {
      errorToast("API Key更新失败")
      console.error(error)
    }
  }

  const handleProviderDelete = async (providerId: any) => {
    try {
      await deleteProvider(providerId)
      successToast("API Key已删除")
    } catch (error) {
      errorToast("删除失败")
      console.error(error)
    }
  }

  const handleModelSwitch = async (providerId: any, modelId: string) => {
    try {
      await setActiveModel(providerId, modelId)
      successToast("模型已切换")
    } catch (error) {
      errorToast("模型切换失败")
      console.error(error)
    }
  }

  // 获取当前激活的Provider和模型信息
  const activeProviderInfo = getActiveProviderInfo()

  if (loading || tokenLoading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 max-w-6xl mx-auto">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">外观设置</h3>
          <p className="text-sm text-muted-foreground mb-4">自定义界面外观</p>
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-medium">主题模式</Label>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isActive = resolvedTheme === option.value
              return (
                <Button
                  key={option.value}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(option.value)}
                  className="flex flex-col gap-1 h-auto py-3 transition-all">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{option.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Provider 管理
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            管理不同AI Provider的API Key，一个API Key可以切换该Provider下的所有模型
          </p>
        </div>

        {/* 当前激活的Provider信息 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">当前激活的Provider</Label>
          {activeProviderInfo ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-blue-900">{activeProviderInfo.provider?.name}</span>
                  <span className="text-blue-700">→</span>
                  <span className="text-blue-900">{activeProviderInfo.activeModel?.name}</span>
                  <span className="text-xs text-blue-600">({activeProviderInfo.activeModel?.alias})</span>
                </div>
                <Select
                  value={storage.globalActiveProvider || ""}
                  onValueChange={handleProviderSetActive}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="选择Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(storage.providers)
                      .filter(([_, provider]) => provider !== null)
                      .map(([providerId, _]) => (
                        <SelectItem key={providerId} value={providerId}>
                          {providerId}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-sm text-gray-600">未激活任何Provider，请先导入API Key</p>
            </div>
          )}
        </div>

        {/* Provider表格 */}
        <ProviderTable
          providerStorage={storage.providers}
          globalActiveProvider={storage.globalActiveProvider}
          onProviderUpdate={handleProviderUpdate}
          onProviderDelete={handleProviderDelete}
          onProviderSetActive={handleProviderSetActive}
          onModelSwitch={handleModelSwitch}
        />
      </div>
    </div>
  )
}