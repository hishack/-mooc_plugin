import type { PlasmoCSConfig } from "plasmo";
import {parseQuestions } from '~utils/getQuestions'


export const config: PlasmoCSConfig = {
  matches: ["https://www.icourse163.org/*"],
  all_frames: true
}


chrome.runtime.onMessage.addListener(

  

  function (request, sender, sendResponse) {
    if (request.name === "questions") {
      const html = document.documentElement.outerHTML;

      sendResponse({ questions: parseQuestions(html) })
    }

  }
);