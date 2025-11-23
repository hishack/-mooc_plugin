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
import { Key, Loader2 } from "lucide-react"

interface ApiImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  modelAlias: string
  modelName: string
  onImport: (apiKey: string) => Promise<void>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!apiKey.trim()) {
      setError("请输入有效的 API Key")
      return
    }

    try {
      await onImport(apiKey)
      setApiKey("")
      onOpenChange(false)
    } catch (err) {
      setError("导入失败，请检查 API Key 是否正确")
      console.error(err)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setApiKey("")
      setError("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              导入 API Key
            </DialogTitle>
            <DialogDescription>
              为 <span className="font-medium">{modelName}</span> 添加 API Key
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`输入 ${modelName} 的 API Key`}
                disabled={loading}
              />
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  导入中...
                </>
              ) : (
                "导入"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}