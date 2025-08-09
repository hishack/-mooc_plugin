import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { useSettings } from "@/hooks/use-settings"
import { useTheme } from "@/hooks/use-theme"
import { Monitor, Moon, Pencil, Sun, Trash } from "lucide-react"
import React, { useState } from "react"

import { useTokenInfo } from "~hooks/use-tokenInfo"
import { errorToast, successToast } from "~utils/Tip"

export function Settings() {
  const { appearance, loading, updateAppearance } = useSettings()

  const [token, setToken] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const { tokenInfo, clearTokenInfo, updateTokenInfo } = useTokenInfo()

  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { resolvedTheme, setTheme } = useTheme({
    theme: appearance.theme,
    onThemeChange: (theme) => updateAppearance({ theme })
  })

  const themeOptions = [
    { value: "system", label: "系统", icon: Monitor },
    { value: "light", label: "浅色", icon: Sun },
    { value: "dark", label: "深色", icon: Moon }
  ] as const

  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token.trim()) {
      errorToast("请输入有效的API Key")
      return
    }

    setSaving(true)
    try {
      await updateTokenInfo({
        token: token,
        establish_time: new Date().toISOString()
      })
      successToast("保存成功")
      setToken("")
      setIsDialogOpen(false)
    } catch (err) {
      errorToast("保存失败")
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleModelChange = async (newModel: "v1" | "R1") => {
    await updateTokenInfo({ model: newModel })
    successToast("模型已更新")
  }

  const formatTokenDisplay = (token: string) => {
    if (!token) return "未设置"
    if (token.length <= 8) return token
    return `${token.slice(0, 4)}***${token.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "未设置"
    return new Date(dateString).toLocaleDateString()
  }

  const apiKeys = tokenInfo.token
    ? [
        {
          key: tokenInfo.token,
          createdAt: tokenInfo.establish_time,
          balance: tokenInfo.token_rest_money,
          lastUsedAt: "-",
          model: tokenInfo.model
        }
      ]
    : []

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">外观</h3>
          <p className="text-xs text-muted-foreground mb-4">自定义界面外观</p>
        </div>
        <div className="space-y-3">
          <Label className="text-sm font-medium">主题</Label>
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
                  className="flex flex-col gap-1 h-auto py-3">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{option.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
      <Separator />

      <div className="flex-1 overflow-auto">
        <Table className="w-full text-xs">
          <TableHeader>
            <TableRow className="h-8">
              <TableHead className="py-1 w-[120px]">API Key</TableHead>
              <TableHead className="py-1">模型选择</TableHead>
              <TableHead className="py-1">创建日期</TableHead>
              <TableHead className="py-1">余额</TableHead>
              <TableHead className="py-1 w-[50px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys.map((apiKey, index) => (
              <TableRow key={index} className="h-8">
                <TableCell className="py-1 w-[120px] font-mono text-muted-foreground">
                  {formatTokenDisplay(apiKey.key)}
                </TableCell>
                <TableCell className="py-1 text-muted-foreground">
                  <Select
                    value={apiKey.model}
                    onValueChange={handleModelChange}>
                    <SelectTrigger className="w-[60px] h-6 text-xs">
                      <SelectValue placeholder="选择模型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1">v1</SelectItem>
                      <SelectItem value="R1">R1</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="py-1 text-muted-foreground">
                  {formatDate(apiKey.createdAt)}
                </TableCell>
                <TableCell className="py-1 text-muted-foreground">
                  {apiKey.balance + "￥"}
                </TableCell>
                <TableCell className="text-right py-1">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => clearTokenInfo()}>
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">添加API Key</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveToken}>
            <DialogHeader>
              <DialogTitle>请勿泄露你的API Key</DialogTitle>
              <DialogDescription>请妥善保管你的API Key</DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              <div className="grid gap-1">
                <Label htmlFor="api">API Key</Label>
                <Input
                  id="api"
                  name="apiKey"
                  placeholder="输入你的API Key"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="flex flex-row justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" size="sm" type="button">
                  取消
                </Button>
              </DialogClose>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
