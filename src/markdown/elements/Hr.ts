import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  RenderResult,
  RenderOptions,
} from '../types';

import Element from './Element';

export default class HrElement extends Element<undefined> {
  constructor() {
    super(undefined);
  }

  // eslint-disable-next-line class-methods-use-this
  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    const paddingY = 5;
    const s = start ?? { x: 0, y: 0 };
    const width = edge.width - (s.x - edge.x);

    const drawColor = pdf.getDrawColor();

    pdf
      .setDrawColor('lightgrey')
      .line(
        s.x,
        s.y + paddingY,
        s.x + width,
        s.y + paddingY,
      )
      .setDrawColor(drawColor);

    const res = {
      width,
      height: (2 * paddingY) + 1,
    };

    return {
      ...res,
      lastLine: res,
      isBlock: true,
    };
  }
}
