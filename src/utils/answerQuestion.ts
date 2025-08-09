import type { Answer } from './constants';

export const autoAnswer = async (answerData: Answer, baseDelay: number = 1200, interOptionDelay: number = 500) => {
  if (!answerData || !answerData.answer || answerData.answer.length === 0) {
    console.error('错误：未提供有效的答题数据');
    return;
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // 强大的事件触发器，模拟完整的用户点击过程
  const triggerClickAndCheck = async (element: HTMLInputElement) => {
    let attempts = 0;
    const maxAttempts = 3;

    while (!element.checked && attempts < maxAttempts) {
      ;
      
      // 模拟完整的点击序列
      element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
      await sleep(50);
      element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
      await sleep(50);
      element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      await sleep(150); // 留出时间给页面脚本响应
      
      // 再次检查状态，如果未选中，则强制设置并触发change事件
      if (!element.checked) {
        element.checked = true;
        element.dispatchEvent(new Event('change', { bubbles: true }));
        await sleep(100);
      }
      
      attempts++;
    }
    
    // 如果多次尝试后仍然未选中，则发出警告
    if (!element.checked) {
      console.warn(`警告：选项 ${element.id} 多次尝试后仍未选中`);
    }
  };

  ;

  for (const [qIndex, questionAnswer] of answerData.answer.entries()) {
    ;
    
    const questionContainers = document.querySelectorAll('.m-choiceQuestion.u-questionItem');
    let targetContainer = null;
    const questionId = String(questionAnswer.id);

    for (const container of questionContainers) {
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

    // 处理选项
    for (const option of questionAnswer.answer) {
      const optionLabels = targetContainer.querySelectorAll('label.u-tbl');
      let targetLabel = null;

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
        
        // 可视化反馈
        targetLabel.style.transition = 'background-color 0.3s';
        targetLabel.style.backgroundColor = '#f0f8ff';
        
        // 调用增强后的点击函数
        await triggerClickAndCheck(inputElement);

        targetLabel.style.backgroundColor = '';
        ;
        
      } catch (error) {
        console.error(`选择选项 ${option} 时出错:`, error);
        await sleep(800);
      }
    }

    await sleep(baseDelay + Math.random() * 800);
  }

  ;
  return 'success';
};