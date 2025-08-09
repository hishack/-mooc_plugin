import type { PlasmoCSConfig } from "plasmo";
import { autoAnswer } from "~utils/answerQuestion";

export const config: PlasmoCSConfig = {
  matches: ["https://www.icourse163.org/*"],
  run_at: 'document_start'
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.name === "answerQuestion") {
    // Handle the message asynchronously
    (async () => {
      try {
        if (!request.body?.answers) {
          throw new Error('No answers provided in request body');
        }

        const answers = {
          answer: request.body.answers
        };

        const res = await autoAnswer(answers);
        ;
        
        // Assuming autoAnswer returns a boolean or similar
        sendResponse({
          message: res ? 'ok' : 'err',
          details: res || undefined
        });
      } catch (err) {
        console.error('Error in answerQuestion handler:', err);
        sendResponse({
          message: 'err',
          error: err instanceof Error ? err.message : String(err)
        });
      }
    })();

    // Return true to indicate we want to send a response asynchronously
    return true;
  }
  
  // Return false for other messages to close the channel
  return false;
});