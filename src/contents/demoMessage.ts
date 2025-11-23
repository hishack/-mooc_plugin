import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://www.icourse163.org/*"],
  all_frames: true
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.name === "demoMessage") {
      console.log("Content: 收到来自 background 的消息:", request.body?.message)

      const receivedMessage = request.body?.message || "Hello from background!"
      const timestamp = new Date().toLocaleTimeString()

      sendResponse({
        success: true,
        receivedAt: timestamp,
        originalMessage: receivedMessage,
        reply: "Content 已成功接收到消息！"
      })
    }
  }
)