import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  PDFDefault,
  RenderResult,
} from '../types';

import Element from './Element';

export default class HrElement extends Element<undefined> {
  constructor() {
    super(undefined);
  }

  // eslint-disable-next-line class-methods-use-this
  render(
    pdf: jsPDF,
    def: PDFDefault,
    start: Position,
    edge: Area,
  ): RenderResult {
    pdf
      .setDrawColor('lightgrey')
      .line(
        start.x,
        start.y,
        start.x + edge.width,
        start.y,
      )
      .setDrawColor(def.drawColor);

    const res = {
      width: edge.width,
      height: 1,
    };

    return {
      ...res,
      lastLine: res,
      isBlock: true,
    };
  }
}
