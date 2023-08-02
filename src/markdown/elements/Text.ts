import { unescape } from 'lodash';

import type { jsPDF } from 'jspdf';

import type {
  Position,
  Size,
  Area,
  RenderResult,
  RenderOptions,
} from '../types';

import Element from './Element';

export default class TextElement extends Element<string> {
  static sanitizeContent(content: string) {
    return unescape(content)
      .replace(/\n/g, '');
  }

  static getTextOffsetYFix(pdf: jsPDF) {
    // Measure is taken with fontSize = 16 so we scale it
    return pdf.getFontSize() * (5 / 16);
  }

  constructor(content: string) {
    super(TextElement.sanitizeContent(content));
  }

  private printWord(word: string, pdf: jsPDF): Size {
    const textOffsetFix = TextElement.getTextOffsetYFix(pdf);

    const { w: width, h: height } = pdf.getTextDimensions(word);
    // Text is printed from the bottom-left corner
    const y = this.cursor.y + height - textOffsetFix;

    pdf.text(word, this.cursor.x, y);
    return { width, height };
  }

  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    // Setup default values needed at render
    const s = start ?? { x: edge.x, y: edge.y };
    this.cursor = { ...s };

    // Print word per word to mimic CSS's property `word-break: break-word;`
    const words = this.content.split(' ');

    let totalWidth = 0;
    let lines = 1;
    const lastLine: Size = { width: 0, height: 0 };
    let hasCreatedPage = false;

    for (let i = 0; i < words.length; i += 1) {
      let word = words[i];
      // As we write word by word, we force the first letter to be a space
      word = (i !== 0 ? ' ' : '') + word.trim();

      let { w: wordWidth, h: wordHeight } = pdf.getTextDimensions(word);

      if (wordWidth > edge.width) {
        throw new Error(`Word "${word.trim()}" is too long to be printed.`);
      }

      // If will be overflowing horizontal
      if (this.cursor.x + wordWidth > edge.x + edge.width) {
        lines += 1;
        // Return to the edge
        this.cursor.x = edge.x;
        this.cursor.y += wordHeight;

        lastLine.width = 0;

        word = word.trimStart();
        ({ w: wordWidth, h: wordHeight } = pdf.getTextDimensions(word));
      }

      // If will be overflowing vertical
      if (
        opts.pageBreak
        && this.cursor.y + wordHeight > edge.y + edge.height
      ) {
        pdf.addPage();
        this.cursor = { x: edge.x, y: edge.y };
        hasCreatedPage = true;
      }

      this.printWord(word, pdf);
      this.cursor.x += wordWidth;

      // Updating size counters
      lastLine.width += wordWidth;
      lastLine.height = wordHeight;

      // Keep the wider line
      totalWidth = Math.max(totalWidth, lastLine.width);
    }

    return {
      width: totalWidth,
      height: lines * lastLine.height,
      lastLine,
      isBlock: lines > 1,
      hasCreatedPage,
    };
  }
}
