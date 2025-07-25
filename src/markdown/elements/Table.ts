import Element from './Element';

import type jsPDF from 'jspdf';

import type {
  Area,
  Position,
  RenderOptions,
  RenderResult,
} from '../types';
import type TableRowElement from './TableRow';

export default class TableElement extends Element<undefined> {
  declare protected children: TableRowElement[];

  protected marginBottom = 20;

  constructor(
    private header: TableRowElement[],
    private body: TableRowElement[],
  ) {
    super(undefined, [...header, ...body]);
  }

  // eslint-disable-next-line class-methods-use-this
  private drawBorder(pdf: jsPDF, area: Area) {
    // Measure is taken with fontSize = 16 so we scale it
    const borderRadius = pdf.getFontSize() * (5 / 16);
    const drawColor = pdf.getDrawColor();
    const lineWidth = pdf.getLineWidth();

    pdf
      .setDrawColor('black')
      .setLineWidth(2)
      .roundedRect(
        area.x,
        area.y,
        area.width,
        area.height,
        borderRadius,
        borderRadius,
      )
      .setLineWidth(lineWidth)
      .setDrawColor(drawColor);
  }

  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    const marginX = 5;
    const e = { ...edge };
    const s = start ?? { x: e.x, y: e.y };
    s.x += marginX;
    e.width -= 2 * marginX;
    this.cursor = { ...s };
    let hasCreatedPage = false;

    const pageSize = {
      height: pdf.internal.pageSize.getHeight(),
      width: pdf.internal.pageSize.getWidth(),
    };
    const drawColor = pdf.getDrawColor();
    const lineWidth = pdf.getLineWidth();

    let lastLine = { height: 0, width: 0 };
    // Draw header
    // eslint-disable-next-line no-restricted-syntax
    for (const row of this.header) {
      const rendered = row.render(
        pdf,
        opts,
        e,
        this.cursor,
      );

      this.cursor = { x: s.x, y: this.cursor.y + rendered.height };
      lastLine = { width: rendered.height, height: rendered.height };
    }

    // Draw separator
    pdf
      .setDrawColor('black')
      .setLineWidth(2)
      .line(
        this.cursor.x,
        this.cursor.y,
        this.cursor.x + e.width,
        this.cursor.y,
      )
      .setLineWidth(lineWidth)
      .setDrawColor(drawColor);

    // Draw body
    for (let i = 0; i < this.body.length; i += 1) {
      const row = this.body[i];

      if (i > 0) {
        pdf
          .setDrawColor('lightgrey')
          .line(
            this.cursor.x,
            this.cursor.y,
            this.cursor.x + e.width,
            this.cursor.y,
          )
          .setDrawColor(drawColor);
      }

      // Hidden render to check if row will overflow
      const shadowRender = row.render(
        pdf,
        opts,
        {
          x: -pageSize.width,
          y: -pageSize.height,
          width: e.width,
          height: e.height,
        },
      );

      // If overflow
      if (opts.pageBreak && this.cursor.y + shadowRender.height > e.y + e.height) {
        this.drawBorder(
          pdf,
          {
            x: s.x,
            y: s.y,
            height: e.height - s.y + 10,
            width: e.width,
          },
        );

        pdf.addPage();
        hasCreatedPage = true;

        s.y = e.y;
        this.cursor = { ...s };
      }

      // Actual render
      const rendered = row.render(
        pdf,
        opts,
        e,
        this.cursor,
      );

      this.cursor = { x: s.x, y: this.cursor.y + rendered.height };
      lastLine = { width: rendered.height, height: rendered.height };
    }

    const res = {
      height: this.cursor.y - s.y,
      width: e.width,
    };

    this.drawBorder(
      pdf,
      {
        x: s.x,
        y: s.y - (hasCreatedPage ? 10 : 0),
        height: res.height + (hasCreatedPage ? 10 : 0),
        width: res.width,
      },
    );

    return {
      height: res.height + this.marginBottom,
      width: res.width,
      lastLine,
      isBlock: true,
      hasCreatedPage,
    };
  }
}
