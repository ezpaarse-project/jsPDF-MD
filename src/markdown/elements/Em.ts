import type { jsPDF } from 'jspdf';

import {
  Position, Area, RenderResult, RenderOptions,
} from '../types';

import TextElement from './Text';

export default class EmElement extends TextElement {
  constructor(
    content: string,
    private isBold: boolean,
  ) {
    super(content);
  }

  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    const font = pdf.getFont();
    pdf.setFont(font.fontName, this.isBold ? 'bolditalic' : 'italic');

    const rendered = super.render(
      pdf,
      opts,
      edge,
      start,
    );

    pdf.setFont(font.fontName, font.fontStyle);

    return rendered;
  }
}
