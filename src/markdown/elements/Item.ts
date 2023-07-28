import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  PDFDefault,
  RenderResult,
} from '../types';

import type Element from './Element';
import type ListElement from './List';
import ParagraphElement from './Paragraph';

export default class ListItemElement extends ParagraphElement {
  protected marginBottom = 0;

  constructor(
    children: Element[],
    private subLists: ListElement[] = [],
  ) {
    super(children);
  }

  render(
    pdf: jsPDF,
    def: PDFDefault,
    start: Position,
    edge: Area,
  ): RenderResult {
    const paddingLeft = 24;

    const rendered = super.render(
      pdf,
      def,
      start,
      edge,
    );

    if (this.subLists.length > 0) {
      rendered.width = edge.width;
      rendered.isBlock = true;

      this.cursor.x = edge.x;
      this.cursor.y += rendered.lastLine.height + 3;

      // eslint-disable-next-line no-restricted-syntax
      for (const subList of this.subLists) {
        const subRendered = subList.render(
          pdf,
          def,
          this.cursor,
          {
            x: this.cursor.x + paddingLeft,
            y: this.cursor.y,
            height: 0,
            width: edge.width - this.cursor.x - paddingLeft,
          },
        );

        rendered.height += subRendered.height;
      }
    }

    return rendered;
  }
}
