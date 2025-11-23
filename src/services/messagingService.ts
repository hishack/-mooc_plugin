import { sendToBackground } from "@plasmohq/messaging"

import type { DemoMessageRequest, DemoMessageResponse, QuestionsRequest, QuestionsResponse } from "~types/messaging"

export class MessagingService {
  static async sendDemoMessage(message: string): Promise<DemoMessageResponse> {
    console.log("发送 demo 消息:", message)

    return sendToBackground({
      name: "demoMessage",
      body: { message }
    })
  }

  static async getQuestions(): Promise<QuestionsResponse> {
    console.log("获取题目")

    return sendToBackground({
      name: "questions"
    })
  }

  static async sendAnswerQuestions(answers: any): Promise<any> {
    console.log("发送答案:", answers)

    return sendToBackground({
      name: "answerQuestion",
      body: { answers }
    })
  }

  static async sendAiAnswerQuestions(): Promise<any> {
    console.log("发送 AI 答题请求")

    return sendToBackground({
      name: "aiAnswerQuestions"
    })
  }
}