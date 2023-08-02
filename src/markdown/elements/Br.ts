import type { jsPDF } from 'jspdf';

import type {
  Area,
  RenderResult,
  RenderOptions,
} from '../types';

import Element from './Element';

export default class BrElement extends Element<string> {
  protected marginBottom = 8;

  constructor() {
    super('');
  }

  render(
    _pdf: jsPDF,
    _opts: RenderOptions,
    edge: Area,
  ): RenderResult {
    const res = {
      height: this.marginBottom,
      width: edge.width,
    };

    return {
      ...res,
      lastLine: res,
      isBlock: true,
    };
  }
}
