import type { jsPDF } from 'jspdf';

import type {
  Position,
  Size,
  Area,
  RenderResult,
} from '../types';

import Element from './Element';

export default class ParagraphElement extends Element<undefined> {
  protected marginBottom = 16;

  constructor(children: Element[]) {
    super(undefined, children);
  }

  render(
    pdf: jsPDF,
    edge: Area,
    start?: Position,
  ): RenderResult {
    // Setup default values needed at render
    const s = start ?? { x: edge.x, y: edge.y };
    this.cursor = { ...s };

    const lastLine: Size = { height: 0, width: 0 };
    let maxWidth = 0;
    let width = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const child of this.children) {
      const rendered = child.render(
        pdf,
        edge,
        this.cursor,
      );

      lastLine.height = rendered.lastLine.height;
      // If printed a inline element
      if (!rendered.isBlock) {
        this.cursor.x += rendered.lastLine.width;
        width += rendered.width;
      } else {
        this.cursor.y += rendered.height - rendered.lastLine.height;
        this.cursor.x = s.x + rendered.lastLine.width;

        maxWidth = Math.max(maxWidth, width);
        width = 0;
      }
    }
    lastLine.width = this.cursor.x - s.x;

    return {
      width: maxWidth || width,
      height: (this.cursor.y - s.y) + lastLine.height + this.marginBottom,
      lastLine,
    };
  }
}
