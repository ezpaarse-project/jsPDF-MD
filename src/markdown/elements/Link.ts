import ImgElement from './Img';
import ParagraphElement from './Paragraph';
import TextElement from './Text';

import type { jsPDF } from 'jspdf';

import type {
  Area,
  Position,
  RenderOptions,
  RenderResult,
} from '../types';
import type Element from './Element';

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

    if (rendered.hasCreatedPage) {
      s.x = edge.x;
      s.y = edge.y;
    }

    // Don't add underline if there's an image
    const hasImages = this.children.some((child) => child instanceof ImgElement);
    if (!hasImages) {
      const textOffsetFix = TextElement.getTextOffsetYFix(pdf);
      const offset = gap - textOffsetFix;
      pdf
        // Add underline // TODO: Support multi line
        .setDrawColor('blue')
        .line(
          s.x,
          s.y + rendered.lastLine.height + offset,
          s.x + rendered.lastLine.width,
          s.y + rendered.lastLine.height + offset,
        )
        // Reset style
        .setDrawColor(drawColor);

      rendered.height += offset;
      rendered.lastLine.height += offset;
    }

    // Add link
    pdf
      .setTextColor(fontColor)
      .link(
        s.x,
        s.y,
        rendered.lastLine.width,
        rendered.lastLine.height + (!hasImages ? gap : 0),
        { url: this.href },
      );

    return rendered;
  }
}
