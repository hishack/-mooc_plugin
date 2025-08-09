import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import headerImage from "data-base64:~images/header.jpg"
import wechatPay from "data-base64:~images/support.jpg"
import water from "data-base64:~images/water.png"
import { BadgeCheckIcon, Mail, Sparkles } from "lucide-react"
import { useState } from "react"

export function Profile() {
  const [isThankYouVisible, setIsThankYouVisible] = useState(false)
  const [isWaterHovered, setIsWaterHovered] = useState(false)
  const [isQrHovered, setIsQrHovered] = useState(false)

  const handleDonateClick = () => {
    setIsThankYouVisible(true)
    setTimeout(() => setIsThankYouVisible(false), 3000)
  }

  return (
    <div className="space-y-8 p-4">
      <div className="text-center space-y-4">
        <Avatar className="h-20 w-20 mx-auto ring-2 ring-offset-2 ring-primary/10">
          <AvatarImage src={headerImage} alt="shack" />
          <AvatarFallback className="text-lg font-semibold">
            小清新
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">小清新</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>2053540371.qq.com</span>
          </div>
          <div className="flex justify-center gap-2">
            <Badge
              variant="secondary"
              className="bg-blue-500 text-white dark:bg-blue-600">
              <BadgeCheckIcon className="mr-1 h-3 w-3" />
              汉服
            </Badge>
            <Badge
              className="h-5 min-w-5 rounded-full px-2 font-mono tabular-nums"
              variant="outline">
              古风
            </Badge>
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            <Sparkles className="inline mr-2 h-5 w-5" />
            为创意充电
            <Sparkles className="inline ml-2 h-5 w-5" />
          </h3>
          <p className="text-sm text-muted-foreground">
            开发不易，如果你觉得这个工具对你有帮助，可以请我喝瓶润田哟！
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 items-center">
            <div
              className={`w-24 h-24 p-2 rounded-lg transition-transform duration-500 bg-primary/10 ${isWaterHovered ? "scale-110" : ""}`}
              onMouseEnter={() => setIsWaterHovered(true)}
              onMouseLeave={() => setIsWaterHovered(false)}>
              <img
                src={water}
                alt="润田"
                className="w-full h-full object-contain"
              />
            </div>
            <div
              className={`w-40 h-40 relative transition-transform duration-300 ${isQrHovered ? "scale-105" : ""}`}
              onMouseEnter={() => setIsQrHovered(true)}
              onMouseLeave={() => setIsQrHovered(false)}>
              <img
                src={wechatPay}
                alt="微信收款码"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>

          <Button
            variant="ghost"
            className="text-sm font-semibold"
            onClick={handleDonateClick}>
            投喂一瓶创意水
          </Button>
        </div>
      </div>
    </div>
  )
}
