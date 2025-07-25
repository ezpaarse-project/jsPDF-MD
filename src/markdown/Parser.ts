import { last } from 'lodash';
import { marked } from 'marked';

import * as Md from './elements';

export default class Parser extends marked.Renderer {
  private elements: Md.Element[] = [];

  private imagesToLoad: Md.ImgElement['load'][] = [];

  constructor(private data: string, private logger = console) {
    super();
  }

  /**
   * Parse into MdElements ready to be rendered into PDF
   *
   * @returns The MdDocument
   */
  public async parse() {
    // Reset elements
    this.elements = [];
    this.imagesToLoad = [];

    // Parse using hooks
    await marked.parse(
      this.data,
      {
        async: true,
        renderer: this,
      },
    );

    // Return elements
    return new Md.Document(
      this.elements,
      this.imagesToLoad,
    );
  }

  // Hooks

  code(code: string, language: string | undefined, _isEscaped: boolean) {
    this.elements.push(new Md.CodeElement(code, language));

    return code;
  }

  blockquote(quote: string) {
    const sanitizedQuote = Md.TextElement.sanitizeContent(quote);

    const children = [];
    let innerText = '';
    while (innerText !== sanitizedQuote && this.elements.length > 0) {
      const lastElement = last(this.elements);
      if (typeof lastElement?.content === 'string') {
        innerText = `${lastElement.content}${innerText}`;

        children.unshift(this.elements.pop()!);
      }
    }

    this.elements.push(new Md.QuoteElement(children));

    return quote;
  }

  html(_html: string) {
    this.logger.warn("HTML in MD isn't supported");
    return '';
  }

  heading(
    text: string,
    level: number,
    raw: string,
  ) {
    const sanitizedRaw = Md.TextElement.sanitizeContent(raw);

    const children = [];
    let innerText = '';
    while (innerText !== sanitizedRaw && this.elements.length > 0) {
      const lastElement = last(this.elements);
      if (typeof lastElement?.content === 'string') {
        innerText = `${lastElement.content}${innerText}`;

        children.unshift(this.elements.pop()!);
      }
    }
    this.elements.push(
      new Md.HeadingElement(children, level as Md.HeadingLevel),
    );

    return text;
  }

  hr() {
    this.elements.push(new Md.HrElement());

    return '';
  }

  list(body: string, ordered: boolean, start: number) {
    const sanitizedBody = Md.TextElement.sanitizeContent(body);

    const children = [];
    let innerText = '';
    while (innerText !== sanitizedBody && this.elements.length > 0) {
      const lastElement = last(this.elements);

      // Limit children to ListItem elements
      if (!(lastElement instanceof Md.ListItemElement)) {
        break;
      }

      innerText = `${lastElement.content}${innerText}`;
      children.unshift(this.elements.pop() as Md.ListItemElement);
    }

    this.elements.push(new Md.ListElement(children, ordered, start));

    return body;
  }

  listitem(text: string, _task: boolean, _checked: boolean) {
    const sanitizedText = Md.TextElement.sanitizeContent(text);

    const children = [];
    const subLists = [];
    let innerText = '';
    while (innerText !== sanitizedText && this.elements.length > 0) {
      const lastElement = last(this.elements);
      if (typeof lastElement?.content === 'string' || lastElement instanceof Md.CheckboxElement) {
        innerText = `${lastElement.content}${innerText}`;

        const popped = this.elements.pop()!;
        if (popped instanceof Md.ListElement) {
          subLists.unshift(popped);
        } else {
          children.unshift(popped);
        }
      }
    }

    this.elements.push(new Md.ListItemElement(children, subLists));

    return text;
  }

  checkbox(checked: boolean) {
    this.elements.push(new Md.CheckboxElement(checked));

    return `${checked}`;
  }

  paragraph(text: string) {
    const sanitizedText = Md.TextElement.sanitizeContent(text);

    const children = [];
    let innerText = '';
    while (innerText !== sanitizedText && this.elements.length > 0) {
      const lastElement = last(this.elements);
      if (typeof lastElement?.content === 'string') {
        innerText = `${lastElement.content}${innerText}`;

        children.unshift(this.elements.pop()!);
      }
    }

    this.elements.push(new Md.ParagraphElement(children));

    return text;
  }

  table(header: string, body: string) {
    const sanitizedBody = Md.TextElement.sanitizeContent(body);
    const sanitizedHeader = Md.TextElement.sanitizeContent(header);

    const bodyEls = [];
    let innerText = '';
    while (innerText !== sanitizedBody && this.elements.length > 0) {
      const lastElement = last(this.elements);

      // Limit children to TableRow elements
      if (!(lastElement instanceof Md.TableRowElement)) {
        break;
      }

      innerText = `${lastElement.content}${innerText}`;
      bodyEls.unshift(this.elements.pop()! as Md.TableRowElement);
    }

    const headerEls = [];
    innerText = '';
    while (innerText !== sanitizedHeader && this.elements.length > 0) {
      const lastElement = last(this.elements);

      // Limit children to TableRow elements
      if (!(lastElement instanceof Md.TableRowElement)) {
        break;
      }

      innerText = `${lastElement.content}${innerText}`;
      headerEls.unshift(this.elements.pop()! as Md.TableRowElement);
    }

    this.elements.push(new Md.TableElement(headerEls, bodyEls));

    return `${header}${body}`;
  }

  tablerow(content: string) {
    const sanitizedContent = Md.TextElement.sanitizeContent(content);

    const children = [];
    let innerText = '';
    while (innerText !== sanitizedContent && this.elements.length > 0) {
      const lastElement = last(this.elements);

      // Limit children to TableCell elements
      if (!(lastElement instanceof Md.TableCellElement)) {
        break;
      }

      innerText = `${lastElement.content}${innerText}`;
      children.unshift(this.elements.pop()! as Md.TableCellElement);
    }

    this.elements.push(new Md.TableRowElement(children));

    return content;
  }

  tablecell(
    content: string,
    flags: {
      header: boolean;
      align: Md.CellAlign | null;
    },
  ) {
    const sanitizedContent = Md.TextElement.sanitizeContent(content);

    const children = [];
    let innerText = '';
    while (innerText !== sanitizedContent && this.elements.length > 0) {
      const lastElement = last(this.elements);
      if (typeof lastElement?.content === 'string') {
        innerText = `${lastElement.content}${innerText}`;
        children.unshift(this.elements.pop()!);
      }
    }

    this.elements.push(new Md.TableCellElement(children, flags.header, flags.align ?? undefined));

    return content;
  }

  strong(text: string) {
    const sanitizedText = Md.TextElement.sanitizeContent(text);

    const boldElements = [];
    let innerText = '';
    while (innerText !== sanitizedText && this.elements.length > 0) {
      const lastElement = this.elements.pop();
      const content = typeof lastElement?.content === 'string' ? lastElement.content : text;
      innerText = `${content}${innerText}`;

      boldElements.unshift(
        new Md.StrongElement(
          content,
          lastElement instanceof Md.EmElement,
        ),
      );
    }
    this.elements.push(...boldElements);

    return text;
  }

  em(text: string) {
    const sanitizedText = Md.TextElement.sanitizeContent(text);

    const italicElements = [];
    let innerText = '';
    while (innerText !== sanitizedText && this.elements.length > 0) {
      const lastElement = this.elements.pop();
      const content = typeof lastElement?.content === 'string' ? lastElement.content : text;
      innerText = `${content}${innerText}`;

      italicElements.unshift(
        new Md.EmElement(
          content,
          lastElement instanceof Md.StrongElement,
        ),
      );
    }
    this.elements.push(...italicElements);

    return text;
  }

  codespan(code: string) {
    this.elements.push(new Md.CodeSpanElement(code));

    return code;
  }

  br() {
    this.elements.push(new Md.BrElement());

    return '';
  }

  del(text: string) {
    const sanitizedText = Md.TextElement.sanitizeContent(text);

    const children = [];
    let innerText = '';
    while (innerText !== sanitizedText && this.elements.length > 0) {
      const lastElement = last(this.elements);
      if (typeof lastElement?.content === 'string') {
        innerText = `${lastElement.content}${innerText}`;

        children.unshift(this.elements.pop()!);
      }
    }

    this.elements.push(new Md.DelElement(children));

    return text;
  }

  link(href: string | null, title: string | null, text: string) {
    const textSanitized = Md.TextElement.sanitizeContent(text);

    const children = [];
    let innerText = '';
    while (innerText !== textSanitized && this.elements.length > 0) {
      const lastElement = last(this.elements);
      if (typeof lastElement?.content === 'string') {
        innerText = `${lastElement.content}${innerText}`;

        children.unshift(this.elements.pop()!);
      }
    }
    this.elements.push(
      new Md.LinkElement(href || '', children),
    );

    return text;
  }

  image(href: string | null, _title: string | null, _text: string) {
    const imgEl = new Md.ImgElement(href ?? '');
    this.elements.push(imgEl);
    this.imagesToLoad.push(async (...args) => imgEl.load(...args));

    return Md.ImgElement.contentPlaceholder;
  }

  text(text: string) {
    this.elements.push(
      new Md.TextElement(
        text,
      ),
    );

    return text;
  }
}
