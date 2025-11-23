import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AI_MODELS } from "~/ai/models"
import { ModelSwitch } from "./ModelSwitch"
import { ApiImportModal } from "./ApiImportModal"
import { Key, Trash2, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"
import type { TokenInfo } from "~/ai/types"

interface ModelTableProps {
  activeModel: string | null
  tokenInfos: Record<string, TokenInfo>
  onModelSwitch: (modelAlias: string) => void
  onImportApiKey: (modelAlias: string, apiKey: string) => Promise<void>
  onDeleteApiKey: (modelAlias: string) => Promise<void>
}

export function ModelTable({
  activeModel,
  tokenInfos,
  onModelSwitch,
  onImportApiKey,
  onDeleteApiKey
}: ModelTableProps) {
  const [importModal, setImportModal] = useState<{
    open: boolean
    modelAlias: string
    modelName: string
  }>({
    open: false,
    modelAlias: "",
    modelName: ""
  })

  const [importing, setImporting] = useState(false)

  const handleImport = async (apiKey: string) => {
    setImporting(true)
    try {
      await onImportApiKey(importModal.modelAlias, apiKey)
    } finally {
      setImporting(false)
    }
  }

  const formatTokenDisplay = (token: string) => {
    if (!token) return ""
    if (token.length <= 8) return token
    return `${token.slice(0, 4)}***${token.slice(-4)}`
  }

  const getProviderBadgeVariant = (provider: string) => {
    switch (provider) {
      case "deepseek":
        return "default"
      case "glm":
        return "secondary"
      case "doubao":
        return "outline"
      default:
        return "default"
    }
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[120px] min-w-[100px]">模型</TableHead>
                <TableHead className="w-[80px] min-w-[80px]">提供商</TableHead>
                <TableHead className="w-[100px] min-w-[100px]">状态</TableHead>
                <TableHead className="w-[120px] min-w-[100px]">API Key</TableHead>
                <TableHead className="w-[100px] min-w-[80px]">创建时间</TableHead>
                <TableHead className="w-[80px] min-w-[80px] text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AI_MODELS.map((model) => {
                const tokenInfo = tokenInfos[model.alias]
                const hasApiKey = !!tokenInfo
                const isActive = activeModel === model.alias

                return (
                  <TableRow key={model.alias} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {model.name}
                        {isActive && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getProviderBadgeVariant(model.provider)}
                        className="text-xs"
                      >
                        {model.provider}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ModelSwitch
                          enabled={isActive}
                          onToggle={() => onModelSwitch(model.alias)}
                          hasApiKey={hasApiKey}
                        />
                        {!hasApiKey && (
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {hasApiKey ? formatTokenDisplay(tokenInfo.token) : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {hasApiKey
                        ? new Date(tokenInfo.establish_time).toLocaleDateString()
                        : "-"}
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
                                modelAlias: model.alias,
                                modelName: model.name
                              })
                            }
                            className="h-7 px-2 text-xs"
                          >
                            <Key className="h-3 w-3 mr-1" />
                            导入
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteApiKey(model.alias)}
                            className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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

      <ApiImportModal
        open={importModal.open}
        onOpenChange={(open) =>
          setImportModal((prev) => ({ ...prev, open }))
        }
        modelAlias={importModal.modelAlias}
        modelName={importModal.modelName}
        onImport={handleImport}
        loading={importing}
      />
    </>
  )
}