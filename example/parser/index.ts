import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import jsPDF from 'jspdf';
import { type MdImgRemoteRequestor, MdParser } from '../../src';

const remoteRequestor: MdImgRemoteRequestor = async (url, method) => {
  const request = await fetch(url, { method });

  return {
    data: await request.arrayBuffer(),
    headers: Object.fromEntries(request.headers.entries()),
  };
};

const runOnFile = async (file: string) => {
  const path = join(__dirname, file);
  const md = await readFile(path, 'utf-8');

  // Init PDF
  // eslint-disable-next-line new-cap
  const pdf = new jsPDF({
    unit: 'px',
    orientation: 'landscape',
    hotfixes: ['px_scaling'],
    compress: true,
  });

  // Parse Markdown
  const parser = new MdParser(md);
  const doc = await parser.parse();

  // Load images
  await doc.loadImages(
    remoteRequestor,
    'assets',
  );

  // Render
  doc.render(pdf);

  await pdf.save(`${path}.pdf`, { returnPromise: true });
};

runOnFile('../all-markdown.md');
