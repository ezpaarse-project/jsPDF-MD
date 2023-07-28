import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  PDFDefault,
  RenderResult,
} from '../types';

import Element from './Element';
import ParagraphElement from './Paragraph';

export default class LinkElement extends ParagraphElement {
  constructor(
    private href: string,
    children: Element[] = [],
  ) {
    super(children);
  }

  render(
    pdf: jsPDF,
    def: PDFDefault,
    start: Position,
    edge: Area,
  ): RenderResult {
    const gap = 3;

    pdf.setTextColor('blue');

    const rendered = super.render(
      pdf,
      def,
      start,
      edge,
    );

    pdf
      // Add underline // TODO: Support multi line
      .setDrawColor('blue')
      .line(
        start.x,
        start.y + rendered.lastLine.height + gap,
        start.x + rendered.lastLine.width,
        start.y + rendered.lastLine.height + gap,
      )
      // Reset style
      .setDrawColor(def.drawColor)
      .setTextColor(def.fontColor)
      // Add link
      .link(
        start.x,
        start.y,
        rendered.lastLine.width,
        rendered.lastLine.height + gap,
        { url: this.href },
      );

    return rendered;
  }
}
