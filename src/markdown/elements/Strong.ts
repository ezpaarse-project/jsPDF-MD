import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  RenderResult,
} from '../types';

import TextElement from './Text';

export default class StrongElement extends TextElement {
  constructor(
    content: string,
    private isItalic: boolean,
  ) {
    super(content);
  }

  render(
    pdf: jsPDF,
    edge: Area,
    start?: Position,
  ): RenderResult {
    const font = pdf.getFont();
    pdf.setFont(font.fontName, this.isItalic ? 'bolditalic' : 'bold');

    const rendered = super.render(
      pdf,
      edge,
      start,
    );

    pdf.setFont(font.fontName, font.fontStyle);

    return rendered;
  }
}
