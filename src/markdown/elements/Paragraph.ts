import type { jsPDF } from 'jspdf';

import type {
  Position,
  Size,
  Area,
  PDFDefault,
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
    def: PDFDefault,
    start: Position,
    edge: Area,
  ): RenderResult {
    // Setup default values needed at render
    this.cursor = { ...start };

    const lastLine: Size = { height: 0, width: 0 };
    let maxWidth = 0;
    let width = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const child of this.children) {
      const rendered = child.render(
        pdf,
        def,
        this.cursor,
        edge,
      );

      lastLine.height = rendered.lastLine.height;
      // If not printed a block
      if (!rendered.isBlock) {
        this.cursor.x += rendered.lastLine.width;
        width += rendered.width;
      } else {
        this.cursor.y += rendered.height - rendered.lastLine.height;
        this.cursor.x = start.x + rendered.lastLine.width;

        maxWidth = Math.max(maxWidth, width);
        width = 0;
      }
    }
    lastLine.width = this.cursor.x - start.x;

    return {
      width: maxWidth || width,
      height: (this.cursor.y - start.y) + lastLine.height + this.marginBottom,
      lastLine,
    };
  }
}
