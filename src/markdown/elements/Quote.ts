import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  RenderResult,
} from '../types';

import ParagraphElement from './Paragraph';

export default class QuoteElement extends ParagraphElement {
  render(
    pdf: jsPDF,
    edge: Area,
    start?: Position,
  ): RenderResult {
    // TODO: Support nested
    const s = start ?? { x: edge.x, y: edge.y };
    const paddingLeft = 12;
    const barWidth = 3;

    const rendered = super.render(
      pdf,
      {
        ...edge,
        x: edge.x + paddingLeft,
        width: edge.width - paddingLeft,
      },
      {
        x: s.x + paddingLeft,
        y: s.y,
      },
    );

    const fillColor = pdf.getFillColor();
    pdf
      .setFillColor('lightgrey')
      .rect(
        s.x,
        s.y,
        barWidth,
        rendered.height,
        'F',
      )
      .setFillColor(fillColor);

    return {
      ...rendered,
      height: rendered.height + this.marginBottom, // ?
      isBlock: true,
    };
  }
}
