import Element from './Element';

import type jsPDF from 'jspdf';

import type {
  Area,
  Position,
  RenderOptions,
  RenderResult,
} from '../types';
import type TableCellElement from './TableCell';

export default class TableRowElement extends Element<undefined> {
  declare protected children: TableCellElement[];

  constructor(children: TableCellElement[]) {
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
    const cellWidth = (edge.width / this.children.length);

    let maxHeight = 0;
    let lastLine = { height: 0, width: 0 };
    // eslint-disable-next-line no-restricted-syntax
    for (const cell of this.children) {
      const rendered = cell.render(
        pdf,
        opts,
        {
          x: this.cursor.x,
          y: this.cursor.y,
          width: cellWidth,
          height: edge.height,
        },
      );

      this.cursor.x += cellWidth;

      maxHeight = Math.max(maxHeight, rendered.height);
      lastLine = {
        height: rendered.height,
        width: rendered.width,
      };
    }

    // Draw colons separators
    const drawColor = pdf.getDrawColor();
    const lineWidth = pdf.getLineWidth();
    pdf
      .setDrawColor('black')
      .setLineWidth(2);
    for (let i = 1; i < this.children.length; i += 1) {
      pdf.line(
        s.x + i * cellWidth,
        s.y,
        s.x + i * cellWidth,
        s.y + maxHeight,
      );
    }
    pdf
      .setLineWidth(lineWidth)
      .setDrawColor(drawColor);

    return {
      width: edge.width,
      height: maxHeight,
      lastLine,
      isBlock: true,
    };
  }
}
