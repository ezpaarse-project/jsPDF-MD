import type { jsPDF } from 'jspdf';

import type {
  Position,
  Area,
  PDFDefault,
  RenderResult,
} from '../types';

export default abstract class Element<T = unknown> {
  protected cursor: Position;

  protected marginBottom = 0;

  constructor(
    private internalContent: T,
    protected children: Element[] = [],
  ) {
    this.cursor = { x: 0, y: 0 };
  }

  public get content(): T | string {
    if (this.internalContent != null) {
      return this.internalContent;
    }

    return this.children.map(
      (el) => el.content,
    ).join('');
  }

  protected set content(value: T) {
    this.internalContent = value;
  }

  abstract render(
    pdf: jsPDF,
    def: PDFDefault,
    start: Position,
    edge: Area,
  ): RenderResult;
}
