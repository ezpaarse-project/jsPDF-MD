import type jsPDF from 'jspdf';

import {
  Position,
  Area,
  RenderResult,
  RenderOptions,
} from '../types';

import Element from './Element';
import type ImgElement from './Img';
import type { ImgRemoteRequestor } from './Img';

export default class Document extends Element<undefined> {
  constructor(
    children: Element[],
    private imagesToLoad: ImgElement['load'][] = [],
  ) {
    super(undefined, children);
  }

  loadImages(
    remoteRequestor: ImgRemoteRequestor,
    assetDir: string,
  ) {
    return Promise.all(
      this.imagesToLoad.map((loader) => loader(remoteRequestor, assetDir)),
    );
  }

  render(
    pdf: jsPDF,
    opts: RenderOptions = { pageBreak: true },
    edge?: Area,
    start?: Position,
  ): RenderResult {
    // Setup default values needed at render
    const e = edge ?? {
      x: 0,
      y: 0,
      width: pdf.internal.pageSize.getWidth(),
      height: pdf.internal.pageSize.getHeight(),
    };
    const s = start ?? { x: e.x, y: e.y };
    this.cursor = { ...s };
    let hasCreatedPage = false;

    // eslint-disable-next-line no-restricted-syntax
    for (const child of this.children) {
      const rendered = child.render(
        pdf,
        opts,
        e,
        {
          x: s.x,
          y: this.cursor.y,
        },
      );

      if (rendered.hasCreatedPage) {
        this.cursor.y = 0;
      }

      this.cursor.y += rendered.height;

      if (!rendered.hasCreatedPage && this.cursor.y >= e.y + e.height) {
        if (!opts.pageBreak) {
          break;
        }
        pdf.addPage();
        this.cursor = { x: e.x, y: e.y };
        hasCreatedPage = true;
      }
    }

    return {
      ...e,
      lastLine: e,
      isBlock: true,
      hasCreatedPage,
    };
  }
}
