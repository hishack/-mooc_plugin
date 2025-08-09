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
  simpleQuestion: string;
}

/**
 * Parses the provided HTML string to extract a list of questions.
 * @param html The HTML string to parse.
 * @returns An array of Question objects.
 */
export function parseQuestions(html: string): Question[] {
  const root = parse(html);
  const questions: Question[] = [];

  root.querySelectorAll('.m-choiceQuestion.u-questionItem').forEach(questionNode => {
    const id = parseInt(questionNode.querySelector('.position')?.text.trim() || '0');
    const type = questionNode.querySelector('.qaCate span')?.text.trim() || '';
    const score = questionNode.querySelector('.qaCate')?.text.replace(type, '').replace(/[()]/g, '').trim() || '';
    const title = questionNode.querySelector('.j-richTxt')?.text.trim() || '';
    
    const options: { pos: string; content: string }[] = [];
    questionNode.querySelectorAll('.choices > li').forEach(optionNode => {
      const pos = optionNode.querySelector('.optionPos')?.text.trim() || '';
      const content = optionNode.querySelector('.optionCnt')?.text.trim() || '';
      options.push({ pos, content });
    });

    let simpleQuestion = `${id}. ${type} ${title}\n`;
    options.forEach(option => {
      simpleQuestion += `${option.pos}${option.content}\n`;
    });

    questions.push({
      id,
      type,
      score,
      title,
      options,
      simpleQuestion,
    });
  });

  return questions;
}