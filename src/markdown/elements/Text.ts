import { unescape } from 'lodash';
import type { jsPDF } from 'jspdf';

import type {
  Position,
  Size,
  Area,
  PDFDefault,
  RenderResult,
} from '../types';

import Element from './Element';

export default class TextElement extends Element<string> {
  static sanitizeContent(content: string) {
    return unescape(content)
      .replace(/\n/g, '');
  }

  constructor(content: string) {
    super(TextElement.sanitizeContent(content));
  }

  private printWord(word: string, pdf: jsPDF): Size {
    // Text is printed from the bottom-left corner
    const { w: width, h: height } = pdf.getTextDimensions(word);
    const y = this.cursor.y + height;

    pdf.text(word, this.cursor.x, y);
    return { width, height };
  }

  render(
    pdf: jsPDF,
    _def: PDFDefault,
    start: Position,
    edge: Area,
  ): RenderResult {
    // Setup default values needed at render
    this.cursor = { ...start };

    // Print word per word to mimic CSS's property `word-break: break-word;`
    const words = this.content.split(' ');

    let totalWidth = 0;
    let lines = 1;
    const lastLine: Size = { width: 0, height: 0 };

    for (let i = 0; i < words.length; i += 1) {
      let word = words[i];
      // As we write word by word, we force the first letter to be a space
      word = (i !== 0 ? ' ' : '') + word.trim();

      let { w: wordWidth, h: wordHeight } = pdf.getTextDimensions(word);

      if (wordWidth > edge.width) {
        throw new Error(`Word "${word.trim()}" is too long to be printed.`);
      }

      // If will be overflowing
      if (this.cursor.x + wordWidth > edge.x + edge.width) {
        lines += 1;
        // Return to the edge
        this.cursor.x = edge.x;
        this.cursor.y += wordHeight;

        lastLine.width = 0;

        word = word.trimStart();
        ({ w: wordWidth, h: wordHeight } = pdf.getTextDimensions(word));
      }

      // if (this.cursor.y + wordHeight > edge.y + edge.height) {
      //   pdf.addPage();
      //   this.cursor.y = edge.y;
      // }

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
    };
  }
}
