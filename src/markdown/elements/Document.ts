import type jsPDF from 'jspdf';

import {
  Position,
  Area,
  PDFDefault,
  RenderResult,
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
    def: PDFDefault,
    start: Position,
    edge: Area,
  ): RenderResult {
    // Setup default values needed at render
    this.cursor = { ...start };

    // eslint-disable-next-line no-restricted-syntax
    for (const child of this.children) {
      const { height } = child.render(
        pdf,
        def,
        {
          x: start.x,
          y: this.cursor.y,
        },
        edge,
      );

      this.cursor.y += height;
    }

    return {
      ...edge,
      lastLine: edge,
      isBlock: true,
    };
  }
}
