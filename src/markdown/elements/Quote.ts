import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  RenderResult,
  RenderOptions,
} from '../types';

import Element from './Element';
import TextElement from './Text';

export default class QuoteElement extends Element<undefined> {
  protected marginBottom = 16; // Same as ParagraphElement

  constructor(children: Element[]) {
    super(undefined, children);
  }

  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    const s = start ?? { x: edge.x, y: edge.y };
    this.cursor = { ...s };
    const paddingLeft = 12;
    const barWidth = 5;

    // eslint-disable-next-line no-restricted-syntax
    for (const child of this.children) {
      const rendered = child.render(
        pdf,
        opts,
        {
          ...edge,
          x: edge.x + paddingLeft,
          width: edge.width - paddingLeft,
        },
        {
          x: s.x + paddingLeft,
          y: this.cursor.y,
        },
      );

      this.cursor.y += rendered.height;
    }

    const height = this.cursor.y - s.y;

    const fillColor = pdf.getFillColor();
    pdf
      .setFillColor('gray')
      .rect(
        s.x,
        s.y - TextElement.getTextOffsetYFix(pdf),
        barWidth,
        height - (this.marginBottom / 2),
        'F',
      )
      .setFillColor(fillColor);

    const res = {
      width: edge.width,
      height,
    };

    return {
      ...res,
      lastLine: res,
      isBlock: true,
    };
  }
}
