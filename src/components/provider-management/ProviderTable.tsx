import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAllProviders, getProviderClasses } from "~/ai/providers"
import { validateProviderApiKey } from "~/ai/client"
import type { ProviderConfig, AIProvider, ProviderStorage } from "~/ai/types/index"
import { Key, Edit2, Trash2, CheckCircle, AlertCircle, Star } from "lucide-react"
import { useState } from "react"

interface ProviderTableProps {
  providerStorage: Record<AIProvider, ProviderStorage | null>
  globalActiveProvider: AIProvider | null
  onProviderUpdate: (providerId: AIProvider, data: Partial<ProviderStorage>) => Promise<void>
  onProviderDelete: (providerId: AIProvider) => Promise<void>
  onProviderSetActive: (providerId: AIProvider | null) => Promise<void>
  onModelSwitch: (providerId: AIProvider, modelId: string) => Promise<void>
}

export function ProviderTable({
  providerStorage,
  globalActiveProvider,
  onProviderUpdate,
  onProviderDelete,
  onProviderSetActive,
  onModelSwitch
}: ProviderTableProps) {
  const [importModal, setImportModal] = useState<{
    open: boolean
    providerId: AIProvider | null
    providerName: string
  }>({
    open: false,
    providerId: null,
    providerName: ""
  })
  const [importing, setImporting] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [validationResult, setValidationResult] = useState<any>(null)

  const allProviders = getAllProviders()
  const providerClasses = getProviderClasses()

  const handleImportApiKey = async (providerId: AIProvider) => {
    if (!apiKey.trim()) return

    setImporting(true)
    try {
      const result = await validateProviderApiKey(providerId, apiKey.trim())
      setValidationResult(result)

      if (result.success) {
        // 获取推荐模型
        const providerClasses = getProviderClasses()
        const providerClass = providerClasses[providerId]
        const recommendedModel = providerClass?.getRecommendedModel()
        const defaultModel = providerClass?.getDefaultModel()

        // 使用推荐模型，如果不可用则使用默认模型
        const availableModelIds = result.details.availableModels.map((m: any) => m.id)
        const selectedModel = recommendedModel && availableModelIds.includes(recommendedModel.id)
          ? recommendedModel.id
          : defaultModel && availableModelIds.includes(defaultModel.id)
          ? defaultModel.id
          : result.details.availableModels[0].id

        await onProviderUpdate(providerId, {
          apiKey: apiKey.trim(),
          enabledModels: result.details.availableModels.map((m: any) => m.id),
          activeModel: selectedModel,
          token_rest_money: "0",
          establish_time: new Date().toISOString()
        })

        // 如果是第一个Provider，自动设为激活
        const hasAnyProvider = Object.values(providerStorage).some(Boolean)
        if (!hasAnyProvider) {
          await onProviderSetActive(providerId)
        }

        setApiKey("")
        setValidationResult(null)
        setImportModal({ open: false, providerId: null, providerName: "" })
      }
    } catch (error) {
      console.error('❌ 导入失败:', error)
      setValidationResult({
        success: false,
        message: error instanceof Error ? error.message : '导入过程中发生未知错误，请检查API Key是否正确'
      })
    } finally {
      setImporting(false)
    }
  }

  const getProviderStatusBadge = (provider: ProviderStorage | null, providerConfig: ProviderConfig) => {
    if (!provider) {
      return <Badge variant="outline">未连接</Badge>
    }
    if (globalActiveProvider === providerConfig.id) {
      return <Badge variant="default">激活</Badge>
    }
    return <Badge variant="secondary">已连接</Badge>
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[120px] min-w-[100px]">Provider</TableHead>
                <TableHead className="w-[100px] min-w-[80px]">状态</TableHead>
                <TableHead className="w-[150px] min-w-[120px]">当前模型</TableHead>
                <TableHead className="w-[200px] min-w-[150px]">API Key</TableHead>
                <TableHead className="w-[100px] min-w-[80px]">余额</TableHead>
                <TableHead className="w-[100px] min-w-[80px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allProviders.map((providerConfig) => {
                const providerData = providerStorage[providerConfig.id]
                const hasApiKey = !!providerData
                const isActive = globalActiveProvider === providerConfig.id

                return (
                  <TableRow key={providerConfig.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {providerConfig.name}
                        {isActive && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getProviderStatusBadge(providerData, providerConfig)}
                    </TableCell>
                    <TableCell>
                      {providerData ? (
                        <Select
                          value={providerData.activeModel}
                          onValueChange={async (modelId) => {
                          try {
                            // 切换模型时，如果当前Provider不是激活的，自动激活它
                            if (!isActive) {
                              await onProviderSetActive(providerConfig.id)
                            }
                            await onModelSwitch(providerConfig.id, modelId)
                          } catch (error) {
                            console.error('❌ 模型切换失败:', error)
                            // 可以考虑在这里添加toast通知或用户反馈
                          }
                        }}
                          disabled={!hasApiKey}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="选择模型" />
                          </SelectTrigger>
                          <SelectContent>
                            {providerConfig.models.map((model) => {
                              const providerClass = providerClasses[providerConfig.id]
                              const recommendedModel = providerClass?.getRecommendedModel()
                              const isRecommended = recommendedModel?.id === model.id

                              return (
                                <SelectItem key={model.id} value={model.id}>
                                  <div className="flex items-center gap-1">
                                    {model.name} ({model.alias})
                                    {isRecommended && (
                                      <Star className="h-3 w-3 text-yellow-500" fill="currentColor" />
                                    )}
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {hasApiKey ? `${providerData.apiKey.slice(0, 4)}***${providerData.apiKey.slice(-4)}` : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {hasApiKey ? providerData.token_rest_money + "￥" : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {!hasApiKey ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setImportModal({
                                open: true,
                                providerId: providerConfig.id,
                                providerName: providerConfig.name
                              })
                            }
                            className="h-7 px-2 text-xs"
                          >
                            <Key className="h-3 w-3 mr-1" />
                            导入
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setImportModal({
                                  open: true,
                                  providerId: providerConfig.id,
                                  providerName: providerConfig.name
                                })
                              }
                              className="h-7 px-2 text-xs"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onProviderDelete(providerConfig.id)}
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* API Key导入/编辑Modal */}
      {importModal.providerId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {providerStorage[importModal.providerId] ? '编辑' : '导入'} {importModal.providerName} API Key
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={`输入 ${importModal.providerName} 的 API Key`}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={importing}
                />
              </div>

              {/* 验证中状态 */}
              {importing && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  正在验证 API Key 有效性...
                </div>
              )}

              {/* 验证成功显示 */}
              {validationResult?.success && (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">✅ {validationResult.message}</p>
                    <div className="mt-1 text-xs text-green-700">
                      <p>• 可用模型: {validationResult.details.availableModels.map((m: any) => m.name).join(', ')}</p>
                      <p>• 已自动选择推荐模型（带⭐标记）作为默认使用</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 验证失败显示 */}
              {validationResult && !validationResult.success && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">❌ {validationResult.message}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setImportModal({ open: false, providerId: null, providerName: "" })
                  setApiKey("")
                  setValidationResult(null)
                }}
                disabled={importing}
              >
                取消
              </Button>
              <Button
                onClick={() => importModal.providerId && handleImportApiKey(importModal.providerId)}
                disabled={importing || !apiKey.trim()}
              >
                {importing ? "验证中..." : providerStorage[importModal.providerId] ? "更新" : "导入"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}