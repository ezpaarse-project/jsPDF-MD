import ParagraphElement from './Paragraph';

import type { jsPDF } from 'jspdf';

import type {
  Area,
  Position,
  RenderOptions,
  RenderResult,
} from '../types';
import type Element from './Element';
import type ListElement from './List';

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
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    const paddingLeft = 24;

    const rendered = super.render(
      pdf,
      opts,
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
          opts,
          {
            x: edge.x + paddingLeft,
            y: edge.y,
            height: edge.height,
            width: edge.width - paddingLeft,
          },
          { ...this.cursor },
        );

        rendered.height += subRendered.height;
        rendered.lastLine = subRendered.lastLine;

        if (subRendered.hasCreatedPage) {
          rendered.hasCreatedPage = true;
          rendered.height = subRendered.height;
        }
      }
    }

    return rendered;
  }
}
