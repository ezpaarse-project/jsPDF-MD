import TextElement from './Text';

import type { jsPDF } from 'jspdf';

import type {
  Area,
  Position,
  RenderOptions,
  RenderResult,
} from '../types';

export default class StrongElement extends TextElement {
  constructor(
    content: string,
    private isItalic: boolean,
  ) {
    super(content);
  }

  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    const font = pdf.getFont();
    pdf.setFont(font.fontName, this.isItalic ? 'bolditalic' : 'bold');

    const rendered = super.render(
      pdf,
      opts,
      edge,
      start,
    );

    pdf.setFont(font.fontName, font.fontStyle);

    return rendered;
  }
}
