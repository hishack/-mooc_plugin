import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Key, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { validateApiKey } from "~/ai"
import type { ValidationResult } from "~/ai/client"

interface ApiImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modelAlias: string
  modelName: string
  onImport: (apiKey: string, validationResult?: ValidationResult) => Promise<void>
  loading: boolean
}

export function ApiImportModal({
  open,
  onOpenChange,
  modelAlias,
  modelName,
  onImport,
  loading
}: ApiImportModalProps) {
  const [apiKey, setApiKey] = useState("")
  const [error, setError] = useState("")
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!apiKey.trim()) {
      setError("请输入有效的 API Key")
      return
    }

    setValidating(true)
    setValidationResult(null)

    try {
      console.log('🚀 开始验证API Key...')
      const result = await validateApiKey(modelAlias, apiKey.trim())
      setValidationResult(result)

      if (result.success) {
        console.log('✅ 验证成功，准备保存API Key')
        console.log('📊 API响应详情:', result.details)

        // 显示成功信息
        setError("")

        // 延迟一点时间让用户看到成功状态
        setTimeout(() => {
          onImport(apiKey.trim(), result)
          setApiKey("")
          setValidationResult(null)
          onOpenChange(false)
        }, 1000)
      } else {
        console.log('❌ 验证失败:', result.message)
        setError(result.message)
      }
    } catch (err) {
      console.log('💥 验证过程中发生异常:', err)
      setError("验证过程中发生错误，请重试")
    } finally {
      setValidating(false)
    }
  }

  const handleClose = () => {
    if (!loading && !validating) {
      setApiKey("")
      setError("")
      setValidationResult(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              导入 API Key
            </DialogTitle>
            <DialogDescription>
              为 <span className="font-medium">{modelName}</span> 添加 API Key（将自动验证有效性）
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value)
                  setError("")
                  setValidationResult(null)
                }}
                placeholder={`输入 ${modelName} 的 API Key`}
                disabled={loading || validating}
              />

              {/* 验证状态显示 */}
              {validating && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  正在验证 API Key 有效性...
                </div>
              )}

              {/* 验证成功显示 */}
              {validationResult?.success && (
                <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium">✅ {validationResult.message}</p>
                    {validationResult.details && (
                      <div className="mt-1 text-xs text-green-700 space-y-1">
                        <p>• 响应模型: {validationResult.details.model}</p>
                        {validationResult.details.usage && (
                          <p>• Token使用: {JSON.stringify(validationResult.details.usage)}</p>
                        )}
                        {validationResult.details.responseContent && (
                          <p>• 测试响应: {validationResult.details.responseContent}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 错误显示 */}
              {error && !validationResult?.success && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium">❌ {error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading || validating}
              className="w-full sm:w-auto"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading || validating || !apiKey.trim()}
              className="w-full sm:w-auto"
            >
              {(loading || validating) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {validating ? "验证中..." : "导入中..."}
                </>
              ) : (
                "验证并导入"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}