import ParagraphElement from './Paragraph';
import TextElement from './Text';

import type { jsPDF } from 'jspdf';

import type {
  Area,
  Position,
  RenderOptions,
  RenderResult,
} from '../types';

export default class DelElement extends ParagraphElement {
  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    const s = start ?? { x: edge.x, y: edge.y };

    const rendered = super.render(
      pdf,
      opts,
      edge,
      s,
    );

    const offsetTop = 3 * (rendered.lastLine.height / 4) - TextElement.getTextOffsetYFix(pdf);
    const lineWidth = pdf.getLineWidth();
    // TODO: support multi lines
    pdf
      .setLineWidth(2)
      .line(
        s.x - 2,
        s.y + offsetTop,
        s.x + rendered.width + 2,
        s.y + offsetTop,
      )
      .setLineWidth(lineWidth);

    return rendered;
  }
}
