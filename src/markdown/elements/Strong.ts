import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  PDFDefault,
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
    def: PDFDefault,
    start: Position,
    edge: Area,
  ): RenderResult {
    pdf.setFont(def.font.fontName, this.isItalic ? 'bolditalic' : 'bold');

    const rendered = super.render(pdf, def, start, edge);

    pdf.setFont(def.font.fontName, def.font.fontStyle);

    return rendered;
  }
}
