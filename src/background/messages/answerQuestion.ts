
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { sendToContentScript } from "@plasmohq/messaging";
import type { RequestBody, ResponseBody } from "~types/type";




const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
  try {

      sendToContentScript({
      name: 'answerQuestion',
      body: {
        answers:req.body.answers
        }
});

  } catch (error) {
    console.error("Background: 发送消息到 Content Script 或接收响应时失败:", error);
  };
};

export default handler;