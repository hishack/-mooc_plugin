import { Switch } from "@/components/ui/switch"

interface ModelSwitchProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  hasApiKey: boolean
}

export function ModelSwitch({ enabled, onToggle, hasApiKey }: ModelSwitchProps) {
  return (
    <Switch
      checked={enabled}
      onCheckedChange={onToggle}
      disabled={!hasApiKey}
      className={hasApiKey ? "" : "opacity-50 cursor-not-allowed"}
    />
  )
}