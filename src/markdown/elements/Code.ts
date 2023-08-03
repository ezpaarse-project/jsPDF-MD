import type jsPDF from 'jspdf';

import type {
  RenderOptions,
  Area,
  Position,
  RenderResult,
} from '../types';

import Element from './Element';
import TextElement from './Text';

export default class CodeSpanElement extends Element<string> {
  declare protected children: TextElement[];

  protected marginBottom = 20;

  constructor(
    content: string,
    private language?: string,
  ) {
    super(content);

    // TODO: Highlight

    this.children = content.split('\n').map((c) => new TextElement(c));
  }

  private renderBg(
    pdf: jsPDF,
    padding: number,
    maxWidth: number,
    height: number,
  ) {
    const fillColor = pdf.getFillColor();

    pdf
      .setFillColor('#282c34')
      .rect(
        this.cursor.x - padding,
        this.cursor.y,
        maxWidth,
        height + 2,
        'F',
      )
      .setFillColor(fillColor);
  }

  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position | undefined,
  ): RenderResult {
    const s = start ?? { x: edge.x, y: edge.y };
    const padding = pdf.getFontSize() * (10 / 16);

    this.cursor = { x: s.x + padding, y: s.y };
    this.renderBg(pdf, padding, edge.width, padding); // render padding top as BG
    this.cursor.y += padding;

    const font = pdf.getFont();
    const textColor = pdf.getTextColor();

    pdf.setFont(opts.codeFont || 'Monospace');

    let hasCreatedPage = false;
    let lastLine = { width: 0, height: 0 };
    pdf.setTextColor('#abb2bf');
    // eslint-disable-next-line no-restricted-syntax
    for (const child of this.children) {
      const maxWidth = edge.width - (2 * padding);
      const { h: lineHeight } = pdf.getTextDimensions(child.content || ' ', { maxWidth });
      // If will overflow
      if (this.cursor.y + lineHeight > edge.height) {
        this.renderBg(pdf, padding, edge.width, lineHeight);
        hasCreatedPage = true;
        this.cursor.y = edge.y;
        pdf.addPage();
      }

      // Render rect
      this.renderBg(pdf, padding, edge.width, lineHeight);

      // Render code
      const rendered = child.render(
        pdf,
        opts,
        {
          width: maxWidth,
          height: edge.height,
          ...this.cursor,
        },
      );

      this.cursor.y += lineHeight;
      lastLine = rendered.lastLine;
    }
    this.renderBg(pdf, padding, edge.width, padding); // render padding bottom as BG

    pdf
      .setFont(font.fontName)
      .setTextColor(textColor);

    return {
      width: edge.width,
      height: this.cursor.y - (hasCreatedPage ? edge.y : s.y) + padding + this.marginBottom,
      lastLine,
      isBlock: true,
      hasCreatedPage,
    };
  }
}
