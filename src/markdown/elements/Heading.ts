import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
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
    edge: Area,
    start?: Position,
  ): RenderResult {
    const fontSize = pdf.getFontSize();
    pdf.setFontSize(48 / this.level);

    const rendered = super.render(
      pdf,
      edge,
      start,
    );

    pdf.setFontSize(fontSize);

    return rendered;
  }
}
