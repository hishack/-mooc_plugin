import { parse } from 'node-html-parser';

interface Question {
  id: number;
  type: string;
  score: string;
  title: string;
  options: {
    pos: string;
    content: string;
  }[];
  blanks: number;
  simpleQuestion: string;
}

export function parseQuestions(html: string): Question[] {
  const root = parse(html);
  const questions: Question[] = [];

  const allContainers = [
    ...root.querySelectorAll('.m-choiceQuestion.u-questionItem'),
    ...root.querySelectorAll('.m-FillBlank.u-questionItem')
  ];

  allContainers.forEach(questionNode => {
    const id = parseInt(questionNode.querySelector('.position')?.text.trim() || '0');
    const type = questionNode.querySelector('.qaCate span')?.text.trim() || '';
    const score = questionNode.querySelector('.qaCate')?.text.replace(type, '').replace(/[()]/g, '').trim() || '';
    const title = questionNode.querySelector('.j-richTxt')?.text.trim() || '';

    const options: { pos: string; content: string }[] = [];
    let blanks = 0;

    if (type === '单选' || type === '多选' || type === '判断') {
      questionNode.querySelectorAll('.choices > li').forEach(optionNode => {
        const pos = optionNode.querySelector('.optionPos')?.text.trim() || '';
        let content = optionNode.querySelector('.optionCnt')?.text.trim() || '';
        if (type === '判断') {
          if (optionNode.querySelector('.u-icon-correct')) {
            content = '对';
          } else if (optionNode.querySelector('.u-icon-wrong')) {
            content = '错';
          }
        }
        options.push({ pos, content });
      });
    }

    if (type === '填空') {
      blanks = questionNode.querySelectorAll('textarea.j-textarea.inputtxt').length;
    }

    let simpleQuestion = `${id}. ${type} ${title}\n`;
    options.forEach(option => {
      simpleQuestion += `${option.pos}${option.content}\n`;
    });
    if (type === '填空') {
      simpleQuestion += `填空数: ${blanks}\n`;
    }

    questions.push({
      id,
      type,
      score,
      title,
      options,
      blanks,
      simpleQuestion,
    });
  });

  return questions;
}
