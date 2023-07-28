import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  PDFDefault,
  RenderResult,
} from '../types';

import ParagraphElement from './Paragraph';

export default class QuoteElement extends ParagraphElement {
  render(
    pdf: jsPDF,
    def: PDFDefault,
    start: Position,
    edge: Area,
  ): RenderResult {
    // TODO: Support nested
    const paddingLeft = 12;
    const barWidth = 3;

    const rendered = super.render(
      pdf,
      def,
      {
        x: start.x + paddingLeft,
        y: start.y,
      },
      {
        ...edge,
        x: edge.x + paddingLeft,
        width: edge.width - paddingLeft,
      },
    );

    pdf
      .setFillColor('lightgrey')
      .rect(
        start.x,
        start.y,
        barWidth,
        rendered.height,
        'F',
      )
      .setFillColor(def.drawColor);

    return {
      ...rendered,
      height: rendered.height + this.marginBottom, // ?
      isBlock: true,
    };
  }
}
