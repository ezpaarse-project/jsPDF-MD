import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import jsPDF from 'jspdf';
import '../../src';

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

  await (await pdf.mdToPDF(md))
    .save(`${path}.pdf`, { returnPromise: true });
};

runOnFile('../all-markdown.md');
