import Element from './Element';

import type { jsPDF } from 'jspdf';

import type {
  Area,
  Position,
  RenderOptions,
  RenderResult,
  Size,
} from '../types';

export default class ParagraphElement extends Element<undefined> {
  protected marginBottom = 16;

  constructor(children: Element[]) {
    super(undefined, children);
  }

  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    // Setup default values needed at render
    const s = start ?? { x: edge.x, y: edge.y };
    this.cursor = { ...s };

    const lastLine: Size = { height: 0, width: 0 };
    let maxWidth = 0;
    let width = 0;
    let hasCreatedPage = false;
    // eslint-disable-next-line no-restricted-syntax
    for (const child of this.children) {
      const rendered = child.render(
        pdf,
        opts,
        edge,
        this.cursor,
      );

      lastLine.height = rendered.lastLine.height;
      if (rendered.hasCreatedPage) {
        // If printed on a new page
        this.cursor = { x: edge.x, y: edge.y };
        hasCreatedPage = true;
      }

      if (!rendered.isBlock) {
        // If printed a inline element
        this.cursor.x += rendered.lastLine.width;
        width += rendered.width;
      } else {
        // If printed a block
        this.cursor.y += rendered.height - rendered.lastLine.height;
        this.cursor.x = edge.x + rendered.lastLine.width;

        maxWidth = Math.max(maxWidth, (s.x - edge.x) + width);
        width = 0;
      }
    }
    lastLine.width = this.cursor.x - s.x;

    return {
      width: maxWidth || width || edge.width,
      height: this.cursor.y - (hasCreatedPage ? edge.y : s.y) + lastLine.height + this.marginBottom,
      lastLine,
      hasCreatedPage,
    };
  }
}
