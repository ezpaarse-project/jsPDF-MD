import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
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
    edge: Area,
    start?: Position,
  ): RenderResult {
    const paddingLeft = 24;

    const rendered = super.render(
      pdf,
      edge,
      start,
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
          {
            x: this.cursor.x + paddingLeft,
            y: this.cursor.y,
            height: edge.height,
            width: edge.width - paddingLeft,
          },
        );

        rendered.height += subRendered.height;
      }
    }

    return rendered;
  }
}
