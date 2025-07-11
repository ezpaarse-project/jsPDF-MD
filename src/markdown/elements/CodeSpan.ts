import TextElement from './Text';
import '../../fonts/Monospace-normal.js';

import type jsPDF from 'jspdf';

import type {
  Area,
  Position,
  RenderOptions,
  RenderResult,
} from '../types';

export default class CodeSpanElement extends TextElement {
  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    const s = start ?? { x: edge.x, y: edge.y };
    const padding = pdf.getFontSize() * (2 / 16);

    const font = pdf.getFont();
    const fillColor = pdf.getFillColor();
    const textColor = pdf.getTextColor();

    pdf.setFont(opts.codeFont ?? 'Monospace');
    const { w: lineWidth, h: lineHeight } = pdf.getTextDimensions(this.content);
    const { w } = pdf.getTextDimensions(this.content, { maxWidth: edge.width - s.x });
    const parts: Area[] = [
      {
        x: s.x - padding,
        y: s.y - padding,
        width: lineWidth + padding,
        height: lineHeight + padding,
      },
    ];

    // If text will overflow
    if (s.x + lineWidth > edge.width) {
      parts[0].width = w;
      let rest = lineWidth - parts[0].width;
      while (rest > 0) {
        // eslint-disable-next-line n/no-unsupported-features/es-syntax
        const lastPart = parts.at(-1);
        if (lastPart) {
          lastPart.width += (edge.width - lastPart.x);
        }

        const part = {
          x: edge.x,
          y: s.y + (parts.length * lineHeight),
          width: Math.min(rest, edge.width),
          height: lineHeight,
        };

        parts.push(part);
        rest -= part.width;
      }
    }

    pdf.setFillColor('#282c34');
    // eslint-disable-next-line no-restricted-syntax
    for (const part of parts) {
      pdf.rect(
        part.x,
        part.y - (padding / 2),
        part.width,
        part.height + padding,
        'F',
      );
    }
    pdf.setFillColor(fillColor);

    pdf.setTextColor('#abb2bf');
    const rendered = super.render(
      pdf,
      opts,
      edge,
      {
        x: s.x,
        y: s.y,
      },
    );
    pdf
      .setFont(font.fontName)
      .setTextColor(textColor);

    rendered.width += 2 * padding;
    rendered.lastLine.width += 2 * padding;
    return rendered;
  }
}
