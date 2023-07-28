import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  PDFDefault,
  RenderResult,
} from '../types';

import ParagraphElement from './Paragraph';

export default class DelElement extends ParagraphElement {
  render(
    pdf: jsPDF,
    def: PDFDefault,
    start: Position,
    edge: Area,
  ): RenderResult {
    const rendered = super.render(
      pdf,
      def,
      start,
      edge,
    );

    const offsetTop = 3 * (rendered.lastLine.height / 4);
    // TODO: support multi lines
    pdf.line(
      start.x,
      start.y + offsetTop,
      start.x + rendered.width,
      start.y + offsetTop,
    );

    return rendered;
  }
}
