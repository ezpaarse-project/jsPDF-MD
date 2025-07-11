import Element from './Element';
import TextElement from './Text';

import type jsPDF from 'jspdf';

import type {
  Area,
  Position,
  RenderOptions,
  RenderResult,
} from '../types';

export default class CheckboxElement extends Element<string> {
  constructor(content: boolean) {
    super(`${content} `, undefined);
  }

  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    const s = start ?? { x: edge.x, y: edge.y };
    // Measures is taken with fontSize = 16 so we scale it
    const size = pdf.getFontSize() * (24 / 16);
    const marginLeft = pdf.getFontSize() * (5 / 16);
    const padding = size / 8;
    this.cursor = { ...s };

    this.cursor.y -= TextElement.getTextOffsetYFix(pdf) / 2;

    const drawColor = pdf.getDrawColor();
    const lineWidth = pdf.getLineWidth();

    pdf
      .setDrawColor('black')
      .setLineWidth(2)
      .roundedRect(
        this.cursor.x + padding,
        this.cursor.y + padding,
        size - (2 * padding),
        size - (2 * padding),
        padding,
        padding,
      );

    // Draw check
    if (this.content) {
      pdf
        .line(
          this.cursor.x + padding + 4,
          this.cursor.y + (size / 2),
          this.cursor.x + (size / 2) - 2,
          this.cursor.y + size - padding - 5,
        )
        .line(
          this.cursor.x + (size / 2) - 3,
          this.cursor.y + size - padding - 5,
          this.cursor.x + size - padding - 4,
          this.cursor.y + padding + 6,
        );
    }

    // Reset style
    pdf.setDrawColor(drawColor)
      .setLineWidth(lineWidth);

    const res = {
      height: size,
      width: size + marginLeft,
    };

    return {
      ...res,
      lastLine: res,
    };
  }
}
