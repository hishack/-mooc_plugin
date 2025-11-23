import type { PlasmoMessaging } from "@plasmohq/messaging"
import { sendToContentScript } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    console.log("Background: 收到来自 sidepanel 的消息:", req.body)

    const contentScriptResponse = await sendToContentScript({
      name: "demoMessage",
      body: {
        message: req.body?.message || "Hello from sidepanel!"
      }
    })

    console.log("Background: 收到来自 content 的响应:", contentScriptResponse)

    res.send({
      success: true,
      message: "消息已发送到 content 并收到响应",
      contentResponse: contentScriptResponse
    })
  } catch (error) {
    console.error("Background: demo 消息处理失败:", error)
    res.send({
      success: false,
      message: "消息发送失败",
      error: error.message
    })
  }
}

export default handler