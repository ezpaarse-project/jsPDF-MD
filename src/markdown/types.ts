// Common types

export type Position = {
  x: number,
  y: number,
};

export type Size = {
  width: number,
  height: number,
};

export type Area = Position & Size;

export type FontStyle = 'bold' | 'italic' | 'bolditalic';

// Render types

export type RenderResult = Size & {
  lastLine: Size,
  isBlock?: boolean,
  hasCreatedPage?: boolean,
};

export type RenderOptions = {
  pageBreak?: boolean,
  codeFont?: string,
};
