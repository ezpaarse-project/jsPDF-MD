import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  PDFDefault,
  RenderResult,
} from '../types';

import Element from './Element';
import ParagraphElement from './Paragraph';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export default class HeadingElement extends ParagraphElement {
  protected marginBottom = 8;

  constructor(
    children: Element[],
    private level: HeadingLevel,
  ) {
    super(children);
  }

  render(
    pdf: jsPDF,
    def: PDFDefault,
    start: Position,
    edge: Area,
  ): RenderResult {
    const fontSize = 48 / this.level;
    pdf.setFontSize(fontSize);

    const rendered = super.render(
      pdf,
      def,
      start,
      edge,
    );

    pdf.setFontSize(def.fontSize);

    return rendered;
  }
}
