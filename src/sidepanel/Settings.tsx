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
import { ModelTable } from "~/components/model-management/ModelTable"
import { useMultiTokenInfo } from "~/hooks/use-multiTokenInfo"
import { successToast, errorToast } from "~components/alter"
import { Loader2 } from "lucide-react"
import type { ValidationResult } from "~/ai/client"

export function Settings() {
  const { appearance, loading, updateAppearance } = useSettings()
  const { storage, loading: tokenLoading, updateTokenInfo, deleteTokenInfo, setActiveModel } = useMultiTokenInfo()

  const { resolvedTheme, setTheme } = useTheme({
    theme: appearance.theme,
    onThemeChange: (theme) => updateAppearance({ theme })
  })

  const themeOptions = [
    { value: "system", label: "系统", icon: Monitor },
    { value: "light", label: "浅色", icon: Sun },
    { value: "dark", label: "深色", icon: Moon }
  ] as const

  const handleModelSwitch = async (modelAlias: string) => {
    try {
      await setActiveModel(modelAlias)
      successToast("已切换模型")
    } catch (error) {
      errorToast("切换模型失败")
      console.error(error)
    }
  }

  const handleImportApiKey = async (modelAlias: string, apiKey: string, validationResult?: ValidationResult) => {
    try {
      console.log('💾 保存验证过的API Key...', {
        modelAlias,
        hasValidation: !!validationResult,
        validationSuccess: validationResult?.success
      })

      await updateTokenInfo(modelAlias, {
        token: apiKey,
        token_rest_money: "0",
        establish_time: new Date().toISOString()
      })

      // 根据验证结果显示不同的成功消息
      if (validationResult?.success) {
        console.log('🎉 API Key保存成功！验证详情:', validationResult.details)
        successToast(`✅ API Key 验证成功并已保存！`)

        // 如果有余额信息，可以在这里显示
        if (validationResult.details?.usage) {
          console.log('💰 Token使用信息:', validationResult.details.usage)
        }
      } else {
        successToast("API Key 导入成功")
      }
    } catch (error) {
      errorToast("API Key 保存失败")
      console.error('保存API Key时出错:', error)
    }
  }

  const handleDeleteApiKey = async (modelAlias: string) => {
    try {
      await deleteTokenInfo(modelAlias)
      successToast("API Key 已删除")
    } catch (error) {
      errorToast("删除失败")
      console.error(error)
    }
  }

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
            模型管理
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            管理不同AI模型的API Key，每次只能启用一个模型
          </p>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">当前激活模型</Label>
          <Select
            value={storage.activeModel || ""}
            onValueChange={handleModelSwitch}
            disabled={!storage.activeModel && Object.keys(storage.tokens).length === 0}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="请先导入API Key并选择激活模型" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(storage.tokens).map(([alias, tokenInfo]) => (
                <SelectItem key={alias} value={alias}>
                  {alias} ({tokenInfo.token_rest_money || "未知"}余额)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ModelTable
          activeModel={storage.activeModel}
          tokenInfos={storage.tokens}
          onModelSwitch={handleModelSwitch}
          onImportApiKey={handleImportApiKey}
          onDeleteApiKey={handleDeleteApiKey}
        />
      </div>
    </div>
  )
}