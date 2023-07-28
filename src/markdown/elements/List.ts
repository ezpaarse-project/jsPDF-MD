import type { jsPDF } from 'jspdf';

import type {
  Position,
  Size,
  Area,
  RenderResult,
} from '../types';

import Element from './Element';
import ListItemElement from './ListItem';

export default class ListElement extends Element<undefined> {
  declare protected children: ListItemElement[];

  protected marginBottom = 0;

  private paddingLeft = 24;

  constructor(
    children: ListItemElement[],
    private ordered: boolean,
    private start: number,
  ) {
    super(undefined, children);
  }

  private printOrderedBullet(
    pdf: jsPDF,
    elHeight: number,
    number: number,
  ) {
    pdf
      .text(
        `${number}.`,
        this.cursor.x + (this.paddingLeft / 4),
        this.cursor.y + elHeight,
      );
  }

  private printUnorderedBullet(
    pdf: jsPDF,
    elHeight: number,
    drawColor: string,
    fillColor: string,
  ) {
    const bulletRadius = 3;

    pdf
      .setFillColor('black')
      .setDrawColor('black')
      .circle(
        this.cursor.x + (this.paddingLeft / 2),
        this.cursor.y + (elHeight / 2) + (bulletRadius / 2),
        bulletRadius,
        'F',
      )
      .setDrawColor(drawColor)
      .setFillColor(fillColor);
  }

  render(
    pdf: jsPDF,
    edge: Area,
    start?: Position,
  ): RenderResult {
    // Setup default values needed at render
    const s = start ?? { x: edge.x, y: edge.y };
    this.cursor = { ...s };
    let lastLine: Size = { width: 0, height: 0 };
    const gap = 3;

    const drawColor = pdf.getDrawColor();
    const fillColor = pdf.getFillColor();

    for (let i = 0; i < this.children.length; i += 1) {
      const child = this.children[i];
      const width = edge.width - (s.x - edge.x) - this.paddingLeft;
      // Print content
      const rendered = child.render(
        pdf,
        {
          x: this.cursor.x + this.paddingLeft,
          y: this.cursor.y,
          height: 0,
          width,
        },
      );

      // Print bullet
      if (this.ordered) {
        this.printOrderedBullet(
          pdf,
          rendered.lastLine.height,
          this.start + i,
        );
      } else {
        this.printUnorderedBullet(
          pdf,
          rendered.lastLine.height,
          drawColor,
          fillColor,
        );
      }

      this.cursor.y += rendered.height + gap;
      lastLine = rendered.lastLine;
    }

    const res = {
      width: edge.width,
      height: this.cursor.y - s.y,
      lastLine,
      isBlock: true,
    };

    return res;
  }
}
