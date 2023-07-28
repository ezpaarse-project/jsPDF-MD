import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import jsPDF from 'jspdf';
import Parser from '../src/markdown/Parser';

const preparePDF = () => {
  // eslint-disable-next-line new-cap
  const pdf = new jsPDF({
    unit: 'px',
    orientation: 'landscape',
    hotfixes: ['px_scaling'],
    compress: true,
  });

  const defaults = {
    font: pdf.getFont(),
    fontSize: pdf.getFontSize(),
    fontColor: pdf.getTextColor(),
    drawColor: pdf.getDrawColor(),
  };

  const size = {
    width: pdf.internal.pageSize.getWidth(),
    height: pdf.internal.pageSize.getHeight(),
  };

  return {
    pdf,
    defaults,
    size,
  };
};

const remoteRequestor = async (url: string, method: string) => {
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
  const { pdf, defaults, size } = preparePDF();

  // Parse Markdown
  const parser = new Parser(md);
  const doc = await parser.parse();

  // Load images
  await doc.loadImages(
    remoteRequestor,
    'assets',
  );

  // Render
  doc.render(
    pdf,
    {
      ...defaults,
      cursor: { x: 0, y: 0 },
    },
    { x: 0, y: 0 },
    {
      ...size,
      x: 0,
      y: 0,
    },
  );

  await pdf.save(`${path}.pdf`, { returnPromise: true });
};

runOnFile('all-markdown.md');
