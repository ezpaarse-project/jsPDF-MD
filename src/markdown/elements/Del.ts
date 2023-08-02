import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  RenderResult,
  RenderOptions,
} from '../types';

import ParagraphElement from './Paragraph';

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

    const offsetTop = 3 * (rendered.lastLine.height / 4);
    // TODO: support multi lines
    pdf.line(
      s.x,
      s.y + offsetTop,
      s.x + rendered.width,
      s.y + offsetTop,
    );

    return rendered;
  }
}
