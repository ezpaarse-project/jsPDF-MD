import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  PDFDefault,
  RenderResult,
} from '../types';

import TextElement from './Text';

export default class EmElement extends TextElement {
  constructor(
    content: string,
    private isBold: boolean,
  ) {
    super(content);
  }

  render(
    pdf: jsPDF,
    def: PDFDefault,
    start: Position,
    edge: Area,
  ): RenderResult {
    pdf.setFont(def.font.fontName, this.isBold ? 'bolditalic' : 'italic');

    const rendered = super.render(pdf, def, start, edge);

    pdf.setFont(def.font.fontName, def.font.fontStyle);

    return rendered;
  }
}
