import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Image } from 'canvas';
import { lookup } from 'mime-types';
import sharp from 'sharp';

import Element from './Element';

import type { ImageFormat, jsPDF } from 'jspdf';

import type {
  Area,
  Position,
  RenderOptions,
  RenderResult,
  Size,
} from '../types';

interface ImgRequestorResult {
  /**
   * The data of the ressource
   */
  data: ArrayBuffer;
  /**
   * Headers of the response
   */
  headers: Record<string, string>;
}

export type ImgRemoteRequestor = (
  /**
   * The url of the ressource
   */
  url: string,
  /**
   * The method used to get the ressource
   */
  method: string,
) => Promise<ImgRequestorResult> | ImgRequestorResult;

interface ImgMeta {
  height: number;
  width: number;
}

const SupportedMimes: Readonly<Record<string, ImageFormat>> = {
  // Mimes supported by jsPDF
  'image/png': 'PNG',
  'image/tiff': 'TIFF',
  'image/jpg': 'JPG',
  'image/jpeg': 'JPEG',
  'image/gif': 'GIF89a',
  'image/webp': 'WEBP',
  'image/bmp': 'BMP',
} as const;

export default class ImgElement extends Element<string> {
  static contentPlaceholder = '<!-- <img to load> -->';

  private meta: ImgMeta | undefined;

  private mime: string | undefined;

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

    this.mime = headers['Content-Type'] || headers['content-type'];
    if (!this.mime) {
      this.mime = lookup(this.src) || '';
    }
    if (!this.mime) {
      throw new Error(`Cannot resolve MIME type of [${this.src}]`);
    }

    const raw = Buffer.from(file).toString('base64');
    this.content = `data:${this.mime};base64,${raw}`;
  }

  private async fetchLocal(assetDir?: string) {
    if (!assetDir) {
      // eslint-disable-next-line @stylistic/max-len
      throw new Error('Local images are not supported. Please provide a `assetDir` either when fetching images, or in plugin options.');
    }

    const path = join(assetDir, this.src);
    if (!new RegExp(`^${assetDir}/[^.]*$`).test(path)) {
      throw new Error(`Md's image must be in the "${assetDir}" folder. Resolved: "${path}"`);
    }

    const mime = lookup(path);
    if (!mime) {
      throw new Error(`Cannot resolve MIME type of [${this.src}]`);
    }

    this.mime = mime;

    const raw = await readFile(path, 'base64');
    this.content = `data:${mime};base64,${raw}`;
  }

  isLoaded(): boolean {
    return this.content !== ImgElement.contentPlaceholder;
  }

  isLocal(): boolean {
    return !this.isInline() && !this.isRemote();
  }

  isInline(): boolean {
    return /^data:/i.test(this.src);
  }

  isRemote(): boolean {
    return /^https?:\/\//i.test(this.src);
  }

  async load(
    remoteRequestor: ImgRemoteRequestor,
    assetDir?: string,
  ): Promise<{ data: string; height?: number; width?: number }> {
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

    if (this.mime) {
      const format = SupportedMimes[this.mime];
      if (!format) {
        // Try to convert into PNG
        const content = Buffer.from(
          // Remove base64 header
          this.content.replace(`data:${this.mime};base64,`, ''),
          'base64',
        );

        let svg = sharp(content);

        if (this.meta) {
          svg = svg.resize({
            width: this.meta.width,
            height: this.meta.height,
          });
        }

        this.mime = 'image/png';
        const png = (await svg.png().toBuffer()).toString('base64');
        this.content = `data:${this.mime};base64,${png}`;
      }
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
    this.cursor = { ...s };

    // Max image size while keeping aspect ratio
    const size: Size = { width: 0, height: 0 };
    if (this.meta.width >= this.meta.height) {
      const maxW = edge.width - (this.cursor.x - edge.x);
      size.width = Math.min(this.meta.width, maxW);
      size.height = (this.meta.height / this.meta.width) * size.width;
    } else {
      const maxH = edge.height - (this.cursor.y - edge.y);
      size.height = Math.min(this.meta.height, maxH);
      size.width = (this.meta.width / this.meta.height) * size.height;
    }

    const res = {
      width: size.width,
      height: size.height,
      hasCreatedPage: false,
    };

    if (opts.pageBreak && this.cursor.y + size.height > edge.x + edge.height) {
      pdf.addPage();
      this.cursor.x = edge.x;
      this.cursor.y = edge.y;
      res.hasCreatedPage = true;
    }

    pdf.addImage({
      imageData: this.content,
      x: this.cursor.x,
      y: this.cursor.y,
      ...res,
    });

    return {
      ...res,
      lastLine: res,
    };
  }
}
