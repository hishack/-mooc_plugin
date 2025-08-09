import type { PlasmoMessaging } from "@plasmohq/messaging"
import { sendToContentScript } from "@plasmohq/messaging"
import type{ RequestBodyQue,ResponseBodyQue } from "~types/type";
 

 
const handler: PlasmoMessaging.MessageHandler<
  RequestBodyQue,
  ResponseBodyQue
  > = async (req, res) => {
    try {

    const contentScriptResponse = await sendToContentScript({
    name: 'questions'
});
      //对questions进行解析
      const simpleQuestions: string[] = contentScriptResponse.questions.map(
        (question: any) => question.simpleQuestion
      );


    res.send({
      questions: simpleQuestions,
    });

  } catch (error) {
    console.error("Background: 发送消息到 Content Script 或接收响应时失败:", error);
    res.send({
      questions: null,
    });
  }


}
 
export default handler