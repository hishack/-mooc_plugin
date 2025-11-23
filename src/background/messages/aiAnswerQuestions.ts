import type { PlasmoMessaging } from "@plasmohq/messaging";
import { sendToContentScript } from "@plasmohq/messaging";
import type { RequestBody, ResponseBody } from "~types/type";
import { apiAnswer } from "~/ai";
import type { QuestionsAnswer } from "~utils/constants";


const handler: PlasmoMessaging.MessageHandler<RequestBody, ResponseBody> = async (req, res) => {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Get questions from content script
    const contentScriptResponse = await sendToContentScript({
      name: 'questions',
      tabId: activeTab.id,
    });

    if (!contentScriptResponse?.questions) {
      throw new Error('No questions received from content script');
    }

    // Process questions
    const simpleQuestions: string[] = contentScriptResponse.questions.map(
      (question: any) => question.simpleQuestion
    );

    const stringSimpleQuestions = simpleQuestions.join("\n\n");

    // Get answers from AI using new multi-token system
    const aiRes = await apiAnswer({ questions: stringSimpleQuestions });

    if (aiRes === null) {
      res.send({
        messages: '未找到激活的模型或API Key无效，请前往设置页面导入API Key并激活模型'
      })
    } else {
      // Parse answers
      const parsedAnswers: QuestionsAnswer[] = typeof aiRes === 'string' ? JSON.parse(aiRes) : aiRes;

      // Send answers to content script
      const autoAnswer = await sendToContentScript({
        name: 'answerQuestion',
        tabId: activeTab.id,
        body: {
          answers: parsedAnswers
        }
      });

      if (autoAnswer?.message === 'ok') {
        res.send({
          messages: 'ok',
        });
      } else {
        throw new Error(autoAnswer?.message || 'No valid response from content script');
      }
    }

  } catch (err) {
    console.error('aiAnswerQuestions error:', err);
    res.send({
      messages: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
}

export default handler;