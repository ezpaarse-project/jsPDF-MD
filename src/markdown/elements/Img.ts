import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { jsPDF } from 'jspdf';
import { lookup } from 'mime-types';
import { Image } from 'canvas';

import type {
  Position,
  Area,
  PDFDefault,
  RenderResult,
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
    _def: PDFDefault,
    start: Position,
    _edge: Area,
  ): RenderResult {
    if (!this.isLoaded() || !this.meta) {
      throw new Error('Please load image first');
    }

    // Max image size while keeping aspect ratio
    const w = Math.min(this.meta.width, 200);
    const h = (this.meta.height / this.meta.width) * w;

    pdf.addImage({
      imageData: this.content,
      x: start.x,
      y: start.y,
      width: w,
      height: h,
    });

    return {
      height: h,
      width: w,
      lastLine: {
        height: h,
        width: w,
      },
    };
  }
}
