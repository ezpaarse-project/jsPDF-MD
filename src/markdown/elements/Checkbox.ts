import type jsPDF from 'jspdf';

import type {
  RenderOptions,
  Area,
  Position,
  RenderResult,
} from '../types';

import Element from './Element';

export default class CheckboxElement extends Element<boolean> {
  constructor(content: boolean) {
    super(content, undefined);
  }

  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position | undefined,
  ): RenderResult {
    const s = start ?? { x: edge.x, y: edge.y };
    const size = pdf.getFontSize() * (24 / 16);
    const margin = size / 8;
    this.cursor = { ...s };

    const drawColor = pdf.getDrawColor();
    const lineWidth = pdf.getLineWidth();

    pdf
      .setDrawColor('black')
      .setLineWidth(2)
      .roundedRect(
        this.cursor.x + margin,
        this.cursor.y + margin,
        size - (2 * margin),
        size - (2 * margin),
        margin,
        margin,
      );

    // Draw check
    if (this.content) {
      pdf
        .line(
          this.cursor.x + margin + 4,
          this.cursor.y + (size / 2),
          this.cursor.x + (size / 2) - 2,
          this.cursor.y + size - margin - 5,
        )
        .line(
          this.cursor.x + (size / 2) - 3,
          this.cursor.y + size - margin - 5,
          this.cursor.x + size - margin - 4,
          this.cursor.y + margin + 6,
        );
    }

    // Reset style
    pdf.setDrawColor(drawColor)
      .setLineWidth(lineWidth);

    const res = {
      height: size,
      width: size,
    };

    return {
      ...res,
      lastLine: res,
    };
  }
}
