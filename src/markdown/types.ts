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
  /**
   * Size of the last line of the element
   */
  lastLine: Size,
  /**
   * Should the next element render under this one, or after the last line
   */
  isBlock?: boolean,
  /**
   * Is the current element created a new page, always false if `RenderOptions.pageBreak` is false
   */
  hasCreatedPage?: boolean,
};

export type RenderOptions = {
  /**
   * Should create a new page if an element is overflowing
   */
  pageBreak?: boolean,
  /**
   * Font used when rendering a code element
   *
   * Default `Monospace` (included in lib)
   */
  codeFont?: string,
};
