import Parser from './markdown/Parser';

import type jsPDF from 'jspdf';

import type { MarginOption, PluginOptions } from './jspdf'; // extended types
import type { ImgRemoteRequestor } from './markdown/elements/Img';

const defaultRemoteRequestor: ImgRemoteRequestor = async (url: string, method: string) => {
  // eslint-disable-next-line n/no-unsupported-features/node-builtins
  const request = await fetch(url, { method });

  return {
    data: await request.arrayBuffer(),
    headers: Object.fromEntries(request.headers.entries()),
  };
};

/**
 * Render given Markdown into given jsPDF instance
 *
 * @param pdf The jsPDF instance
 * @param md The markdown to render
 * @param opts Options for plugin and for render
 */
const mdToPDF = async (
  pdf: jsPDF,
  md: string,
  opts?: PluginOptions,
): Promise<void> => {
  const {
    remoteRequestor,
    assetDir,
    margin,
    logger,
    ...renderOpts
  } = opts ?? {};

  // Parse margin
  let m: MarginOption = {};
  if (typeof margin === 'object') {
    m = margin;
  } else {
    m = {
      top: margin,
      left: margin,
      bottom: margin,
      right: margin,
    };
  }

  const pageSize = {
    height: pdf.internal.pageSize.getHeight(),
    width: pdf.internal.pageSize.getWidth(),
  };

  // Parse Markdown
  const parser = new Parser(md, logger);
  const doc = await parser.parse();

  // Load images
  await doc.loadImages(
    remoteRequestor ?? defaultRemoteRequestor,
    assetDir,
  );

  // Render
  doc.render(
    pdf,
    renderOpts,
    {
      x: m.left,
      y: m.top,
      width: (m.left ?? m.right) && (pageSize.width - (m.left ?? 0) - (m.right ?? 0)),
      height: (m.top ?? m.bottom) && (pageSize.height - (m.top ?? 0) - (m.bottom ?? 0)),
    },
  );
};

// Kinda copied from https://github.com/simonbengtsson/jsPDF-AutoTable/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const applyPlugin = (pdf: any) => {
  // eslint-disable-next-line no-param-reassign
  pdf.API.mdToPDF = async function mdToPDFPlugin(this: jsPDF, md: string, opts?: PluginOptions) {
    await mdToPDF(this, md, opts);
    return this;
  };
};

try {
  // Using require because we need sync import

  // eslint-disable-next-line @typescript-eslint/no-require-imports, n/global-require
  let jsPDF = require('jspdf');
  // Webpack imported jspdf instead of jsPDF for some reason
  // while it seemed to work everywhere else.
  if ('jsPDF' in jsPDF) jsPDF = jsPDF.jsPDF;
  applyPlugin(jsPDF);
} catch {
  // Importing jspdf in nodejs environments does not work as of jspdf
  // 1.5.3 so we need to silence potential errors to support using for example
  // the nodejs jspdf dist files with the exported applyPlugin
}

export default mdToPDF;

export type {
  ImgRemoteRequestor as MdImgRemoteRequestor,
  /** * @deprecated use `MdParserOptions` instead  */
  PluginOptions,
  PluginOptions as MdParserOptions,
};

export {
  /** * @deprecated use `MdParser` instead  */
  Parser,
  Parser as MdParser,
};
