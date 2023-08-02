import type jsPDF from 'jspdf';

import type {
  RenderOptions,
  Area,
  Position,
  RenderResult,
} from '../types';
import type Element from './Element';

import ParagraphElement from './Paragraph';

export type CellAlign = 'center' | 'left' | 'right';

export default class TableCellElement extends ParagraphElement {
  constructor(
    children: Element[],
    private isHeader: boolean,
    private align: CellAlign = 'left',
  ) {
    super(children);
  }

  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position | undefined,
  ): RenderResult {
    const padding = 5;
    const e = { ...edge };
    e.width -= 2 * padding;
    const s = start ?? { x: e.x, y: e.y };

    const font = pdf.getFont();
    if (this.isHeader) {
      pdf.setFont(font.fontName, 'bold');
    }

    const { w } = pdf.getTextDimensions(this.content ?? '', { maxWidth: e.width });
    s.y += padding;
    switch (this.align) {
      case 'center':
        s.x += (e.width / 2) - (w / 2) + padding;
        break;
      case 'right':
        s.x += e.width - w - padding;
        break;

      case 'left':
        s.x += padding;
        break;

      default:
        break;
    }

    const rendered = super.render(
      pdf,
      opts,
      {
        ...e,
        ...s,
      },
    );

    pdf.setFont(font.fontName, font.fontStyle);

    const res = {
      height: rendered.height,
      width: rendered.width,
    };

    return {
      ...res,
      lastLine: res,
    };
  }
}
