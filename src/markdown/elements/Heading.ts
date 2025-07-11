import ParagraphElement from './Paragraph';

import type { jsPDF } from 'jspdf';

import type Element from './Element';
import type {
  Area,
  Position,
  RenderOptions,
  RenderResult,
} from '../types';

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
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    const fontSize = pdf.getFontSize();
    pdf.setFontSize(48 / this.level);

    const rendered = super.render(
      pdf,
      opts,
      edge,
      start,
    );

    pdf.setFontSize(fontSize);

    return rendered;
  }
}
