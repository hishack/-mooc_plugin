import type { Answer } from './constants';

export const autoAnswer = async (answerData: Answer, baseDelay: number = 800, interOptionDelay: number = 500) => {
  if (!answerData || !answerData.answer || answerData.answer.length === 0) {
    console.error('错误：未提供有效的答题数据');
    return;
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const triggerClickAndCheck = async (element: HTMLInputElement) => {
    let attempts = 0;
    const maxAttempts = 3;
    while (!element.checked && attempts < maxAttempts) {
      element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
      await sleep(50);
      element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
      await sleep(50);
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      await sleep(150);
      if (!element.checked) {
        element.checked = true;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(100);
      }
      attempts++;
    }
    if (!element.checked) {
      console.warn(`警告：选项 ${element.id} 多次尝试后仍未选中`);
    }
  };

  for (const questionAnswer of answerData.answer) {
    const questionId = String(questionAnswer.id);
    let targetContainer: Element | null = null;

    const choiceContainers = document.querySelectorAll('.m-choiceQuestion.u-questionItem');
    const fillContainers = document.querySelectorAll('.m-FillBlank.u-questionItem');

    for (const container of [...choiceContainers, ...fillContainers]) {
      const positionElement = container.querySelector('.position');
      if (positionElement?.textContent?.trim() === questionId) {
        targetContainer = container;
        break;
      }
    }

    if (!targetContainer) {
      console.warn(`未找到题目 ${questionId} 的容器`);
      await sleep(baseDelay);
      continue;
    }

    if (targetContainer.classList.contains('m-choiceQuestion')) {
      for (const option of questionAnswer.answer) {
        const optionLabels = targetContainer.querySelectorAll('label.u-tbl');
        let targetLabel: Element | null = null;
        for (const label of optionLabels) {
          const optionPosElement = label.querySelector('.optionPos');
          if (optionPosElement?.textContent?.trim() === `${option}.`) {
            targetLabel = label;
            break;
          }
        }
        if (!targetLabel) {
          console.warn(`未找到选项 ${option}`);
          continue;
        }
        try {
          const inputId = targetLabel.getAttribute('for');
          const inputElement = inputId ? document.getElementById(inputId) : null;
          if (!(inputElement instanceof HTMLInputElement)) {
            console.warn(`未找到选项 ${option} 的输入元素`);
            continue;
          }
          await sleep(interOptionDelay);
          targetLabel.setAttribute('style', 'transition: background-color 0.3s; background-color: #f0f8ff;');
          await triggerClickAndCheck(inputElement);
          targetLabel.setAttribute('style', '');
        } catch (error) {
          console.error(`选择选项 ${option} 时出错:`, error);
          await sleep(800);
        }
      }
} else if (targetContainer.classList.contains('m-FillBlank')) {
  const input = targetContainer.querySelector('textarea.j-textarea.inputtxt') as HTMLTextAreaElement | null;
  if (!input) {
    console.warn(`未找到填空输入框`);
  } else {
    await sleep(interOptionDelay);
    input.value = questionAnswer.answer.join('，');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

    await sleep(baseDelay + Math.random() * 800);
  }

  return 'success';
};
