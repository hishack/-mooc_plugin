import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Loader2Icon, MessageCircle } from "lucide-react"
import { useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { errorToast, successToast } from "~components/alter"

const FIX_MESSAGES =
  ',请以这种格式只输出答案,只输出答案,填空题不同选项都以逗号隔开:[{"id": 1, "answer": ["B"]},{"id": 2, "answer": ["A", "C"]}]'

export function Home() {
  const [isManualMode, setIsManualMode] = useState(false)
  const [questionsText, setQuestionsText] = useState("")
  const [answers, setAnswers] = useState("")
  const [loading, setLoading] = useState(false)
  const [demoMessage, setDemoMessage] = useState("")
  const [messageResponse, setMessageResponse] = useState("")

  const [messageLoading, setMessageLoading] = useState(false)

  const handleGetQuestions = async () => {
    try {
      const response = await sendToBackground({ name: "questions" })
      if (response?.questions?.length > 0) {
        const simpleQuestions = response.questions.join("\n\n")
        setQuestionsText(simpleQuestions)
        successToast("题目获取成功！")
      } else {
        errorToast("未获取到题目，请确保页面上有题目内容")
        setQuestionsText("")
      }
    } catch (error) {
      console.error("获取题目时发生错误:", error)
      errorToast("获取题目失败，请检查网络连接")
      setQuestionsText("")
    }
  }

  const handleAnswerQuestions = async () => {
    if (!answers) {
      errorToast("请输入答案内容后再进行自动答题")
      return
    }

    try {
      const parsedAnswers = JSON.parse(answers)
      await sendToBackground({
        name: "answerQuestion",
        body: { answers: parsedAnswers }
      })
      successToast("答案已发送，正在进行自动答题...")
    } catch (error) {
      console.error("答题时发生错误:", error)
      errorToast("答案格式不正确，请检查JSON格式")
    }
  }

  const apiAnswerQuestion = async () => {
    setLoading(true)
    try {
      const res = await sendToBackground({ name: "aiAnswerQuestions" })
      if (res.messages === "ok") {
        successToast("自动答题成功！")
      } else {
        errorToast(res.messages || "自动答题失败")
      }
    } catch (error) {
      console.error("后台接收失败:", error)
      errorToast("请求失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyQuestions = () => {
    if (questionsText) {
      const textToCopy = questionsText + FIX_MESSAGES
      navigator.clipboard.writeText(textToCopy)
      successToast("题目和提示词已复制！")
    } else {
      errorToast("没有可复制的内容")
    }
  }

  const handleSendMessage = async () => {
    if (!demoMessage.trim()) {
      errorToast("请输入消息内容")
      return
    }

    setMessageLoading(true)
    try {
      const response = await sendToBackground({
        name: "demoMessage",
        body: { message: demoMessage }
      })

      if (response.success) {
        setMessageResponse(
          `Content 响应: ${response.contentResponse?.reply} (接收时间: ${response.contentResponse?.receivedAt})`
        )
        successToast("消息发送成功！")
      } else {
        setMessageResponse(`发送失败: ${response.message}`)
        errorToast("消息发送失败")
      }
    } catch (error) {
      console.error("发送消息时发生错误:", error)
      setMessageResponse("发送失败: 网络错误")
      errorToast("发送消息失败")
    } finally {
      setMessageLoading(false)
    }
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>通过API自动答题</CardTitle>
            <CardDescription>
              {isManualMode
                ? "手动模式：获取并粘贴答案"
                : "自动模式：后台自动答题已开启"}
            </CardDescription>
            <CardAction>
              <div className="flex items-center space-x-2">
                <Switch
                  id="mode-switch"
                  checked={!isManualMode}
                  onCheckedChange={(checked) => setIsManualMode(!checked)}
                />
                <Label htmlFor="mode-switch">自动模式</Label>
              </div>
            </CardAction>
          </CardHeader>

          {isManualMode && (
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="questions" className="text-sm font-medium">
                      题目
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyQuestions}>
                      复制
                    </Button>
                  </div>
                  <Textarea
                    id="questions"
                    placeholder="点击下方按钮获取题目..."
                    value={questionsText}
                    onChange={(e) => setQuestionsText(e.target.value)}
                    rows={5}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="answers">答案</Label>
                  </div>
                  <Textarea
                    id="answers"
                    placeholder="请将固定格式的答案放入..."
                    value={answers}
                    onChange={(e) => setAnswers(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
            </CardContent>
          )}

          <CardFooter className="flex-col gap-2">
            {isManualMode ? (
              <>
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleGetQuestions}>
                  获取题目
                </Button>
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleAnswerQuestions}>
                  自动答题
                </Button>
              </>
            ) : (
              <Button
                type="button"
                className="w-full"
                onClick={apiAnswerQuestion}
                disabled={loading}>
                {loading && <Loader2Icon className="animate-spin mr-2" />}
                自动答题
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* <Card className="w-full max-w-sm mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              消息通信测试
            </CardTitle>
            <CardDescription>
              测试 Sidepanel → Background → Content → Background → Sidepanel 的消息通信
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="demo-message">发送消息</Label>
                <Textarea
                  id="demo-message"
                  placeholder="输入要发送到 Content 的消息..."
                  value={demoMessage}
                  onChange={(e) => setDemoMessage(e.target.value)}
                  rows={3}
                />
              </div>

              {messageResponse && (
                <div className="grid gap-2">
                  <Label>响应内容</Label>
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {messageResponse}
                  </div>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="button"
              className="w-full"
              onClick={handleSendMessage}
              disabled={messageLoading || !demoMessage.trim()}>
              {messageLoading && <Loader2Icon className="animate-spin mr-2" />}
              发送消息
            </Button>
          </CardFooter>
        </Card> */}
      </div>
    </ScrollArea>
  )
}
