import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { jsPDF } from 'jspdf';
import { lookup } from 'mime-types';
import { Image } from 'canvas';

import type {
  Position,
  Area,
  RenderResult,
  RenderOptions,
  Size,
} from '../types';

import Element from './Element';

type ImgRequestorResult = {
  data: ArrayBuffer,
  headers: Record<string, string>
};

export type ImgRemoteRequestor = (
  url: string,
  method: string,
) => Promise<ImgRequestorResult> | ImgRequestorResult;

type ImgMeta = {
  height: number,
  width: number,
};

export default class ImgElement extends Element<string> {
  static contentPlaceholder = '<!-- <img to load> -->';

  private meta: ImgMeta | undefined;

  constructor(
    private src: string,
  ) {
    super(ImgElement.contentPlaceholder);
  }

  private async loadMetadata() {
    // Waiting Image to "render" to get width & height
    const img = await new Promise<Image>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = this.content;
    });

    this.meta = {
      width: img.width,
      height: img.height,
    };
    return this.meta;
  }

  private async fetchRemote(remoteRequestor: ImgRemoteRequestor) {
    const { data: file, headers } = await Promise.resolve(remoteRequestor(this.src, 'get'));

    let mime: string = headers['Content-Type'] || headers['content-type'];
    if (!mime) {
      mime = lookup(this.src) || '';
    }
    if (!mime) {
      throw new Error(`Cannot resolve MIME type of [${this.src}]`);
    }

    const raw = Buffer.from(file).toString('base64');
    this.content = `data:${mime};base64,${raw}`;
  }

  private async fetchLocal(assetDir: string) {
    const path = join('assets', this.src);
    if (new RegExp(`^${assetDir}/[^.]*$`).test(path) === false) {
      throw new Error(`Md's image must be in the "${assetDir}" folder. Resolved: "${path}"`);
    }

    const mime = lookup(path);
    if (!mime) {
      throw new Error(`Cannot resolve MIME type of [${this.src}]`);
    }

    const raw = await readFile(path, 'base64');
    this.content = `data:${mime};base64,${raw}`;
  }

  isLoaded() {
    return this.content !== ImgElement.contentPlaceholder;
  }

  isLocal() {
    return !this.isInline() && !this.isRemote();
  }

  isInline() {
    return /^data:/i.test(this.src);
  }

  isRemote() {
    return /^https?:\/\//i.test(this.src);
  }

  async load(
    remoteRequestor: ImgRemoteRequestor,
    assetDir: string,
  ) {
    if (!this.isLoaded()) {
      if (this.isRemote()) {
        await this.fetchRemote(remoteRequestor);
      }

      if (this.isLocal()) {
        await this.fetchLocal(assetDir);
      }

      if (this.isInline()) {
        this.content = this.src;
      }

      await this.loadMetadata();
    }

    return {
      ...this.meta,
      data: this.content,
    };
  }

  render(
    pdf: jsPDF,
    opts: RenderOptions,
    edge: Area,
    start?: Position,
  ): RenderResult {
    if (!this.isLoaded() || !this.meta) {
      throw new Error('Please load image first');
    }
    const s = start ?? { x: 0, y: 0 };

    // Max image size while keeping aspect ratio
    const size: Size = { width: 0, height: 0 };
    if (this.meta.width >= this.meta.height) {
      const maxW = edge.width - (s.x - edge.x);
      size.width = Math.min(this.meta.width, maxW);
      size.height = (this.meta.height / this.meta.width) * size.width;
    } else {
      const maxH = edge.height - (s.y - edge.y);
      size.height = Math.min(this.meta.height, maxH);
      size.width = (this.meta.width / this.meta.height) * size.height;
    }

    const res = {
      width: size.width,
      height: size.height,
      hasCreatedPage: false,
    };

    if (opts.pageBreak && s.y + size.height > edge.x + edge.height) {
      pdf.addPage();
      s.x = edge.x;
      s.y = edge.y;
      res.hasCreatedPage = true;
    }

    pdf.addImage({
      imageData: this.content,
      x: s.x,
      y: s.y,
      ...res,
    });

    return {
      ...res,
      lastLine: res,
    };
  }
}
