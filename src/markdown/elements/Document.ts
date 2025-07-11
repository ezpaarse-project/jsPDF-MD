import Element from './Element';

import type jsPDF from 'jspdf';

import type {
  Area,
  Position,
  RenderOptions,
  RenderResult,
} from '../types';
import type ImgElement from './Img';
import type { ImgRemoteRequestor } from './Img';

export default class Document extends Element<undefined> {
  constructor(
    children: Element[],
    private imagesToLoad: ImgElement['load'][] = [],
  ) {
    super(undefined, children);
  }

  /**
   * Load images found during parse
   *
   * @param remoteRequestor The method used to fetch images
   * @param assetDir The folder where to find local images
   *
   * @returns The data loaded
   */
  async loadImages(
    remoteRequestor: ImgRemoteRequestor,
    assetDir?: string,
  ): Promise<{ data: string; height?: number; width?: number }[]> {
    return Promise.all(
      this.imagesToLoad.map(async (loader) => loader(remoteRequestor, assetDir)),
    );
  }

  /**
    * Render given Markdown into given jsPDF instance
    *
    * @param pdf The jsPDF instance
    * @param opts The render options
    * @param edge Edges of the rendered document
    * @param start Position to start withing edges
   */
  render(
    pdf: jsPDF,
    opts: RenderOptions = {},
    edge?: Partial<Area>,
    start?: Position,
  ): RenderResult {
    // eslint-disable-next-line no-param-reassign
    opts.pageBreak = opts.pageBreak ?? true;

    // Setup default values needed at render
    const e = {
      x: edge?.x ?? 0,
      y: edge?.y ?? 0,
      width: edge?.width ?? pdf.internal.pageSize.getWidth(),
      height: edge?.height ?? pdf.internal.pageSize.getHeight(),
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
