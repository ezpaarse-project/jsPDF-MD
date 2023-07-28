import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  RenderResult,
  RenderOptions,
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
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    const s = start ?? { x: edge.x, y: edge.y };
    const gap = 3;

    const fontColor = pdf.getTextColor();
    const drawColor = pdf.getDrawColor();

    pdf.setTextColor('blue');

    const rendered = super.render(
      pdf,
      opts,
      edge,
      s,
    );

    pdf
      // Add underline // TODO: Support multi line
      .setDrawColor('blue')
      .line(
        s.x,
        s.y + rendered.lastLine.height + gap,
        s.x + rendered.lastLine.width,
        s.y + rendered.lastLine.height + gap,
      )
      // Reset style
      .setDrawColor(drawColor)
      .setTextColor(fontColor)
      // Add link
      .link(
        s.x,
        s.y,
        rendered.lastLine.width,
        rendered.lastLine.height + gap,
        { url: this.href },
      );

    rendered.height += 1;
    rendered.lastLine.height += 1;

    return rendered;
  }
}
