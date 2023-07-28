import { marked } from 'marked';

import * as Md from './elements';

export default class MdParser<T = never> extends marked.Renderer<T> {
  private elements: Md.Element[] = [];

  private imagesToLoad: Md.ImgElement['load'][] = [];

  constructor(private data: string) {
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
        mangle: false,
        headerIds: false,
        renderer: this,
      },
    );

    // Return elements
    return new Md.Document(this.elements, this.imagesToLoad);
  }

  // Hooks

  code(_code: string, _language: string | undefined, _isEscaped: boolean) {
    return '';
  }

  blockquote(quote: string) {
    const sanitizedQuote = Md.TextElement.sanitizeContent(quote);

    const children = [];
    let innerText = '';
    while (innerText !== sanitizedQuote && this.elements.length > 0) {
      const lastElement = this.elements.pop();
      if (typeof lastElement?.content === 'string') {
        innerText = `${lastElement.content}${innerText}`;

        children.unshift(lastElement);
      }
    }

    this.elements.push(new Md.QuoteElement(children));

    return quote;
  }

  // eslint-disable-next-line class-methods-use-this
  html(_html: string) {
    throw new Error('HTML in MD are not supported');
    return '';
  }

  heading(
    text: string,
    level: number,
    raw: string,
    _slugger: marked.Slugger,
  ) {
    const sanitizedRaw = Md.TextElement.sanitizeContent(raw);

    const children = [];
    let innerText = '';
    while (innerText !== sanitizedRaw && this.elements.length > 0) {
      const lastElement = this.elements.pop();
      if (typeof lastElement?.content === 'string') {
        innerText = `${lastElement.content}${innerText}`;

        children.unshift(lastElement);
      }
    }
    this.elements.push(
      new Md.HeadingElement(children, level as 1 | 2 | 3 | 4 | 5 | 6),
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
      const lastElement = this.elements.pop();

      // Limit children to ListItem elements
      if (!(lastElement instanceof Md.ListItemElement)) {
        if (lastElement) {
          this.elements.push(lastElement);
        }
        break;
      }

      innerText = `${lastElement.content}${innerText}`;
      children.unshift(lastElement);
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
      const lastElement = this.elements.pop();
      if (typeof lastElement?.content === 'string') {
        innerText = `${lastElement.content}${innerText}`;

        if (lastElement instanceof Md.ListElement) {
          subLists.unshift(lastElement);
        } else {
          children.unshift(lastElement);
        }
      }
    }

    this.elements.push(new Md.ListItemElement(children, subLists));

    return text;
  }

  checkbox(_checked: boolean) {
    // TODO[feat]: support checkbox

    return '';
  }

  paragraph(text: string) {
    const sanitizedText = Md.TextElement.sanitizeContent(text);

    const children = [];
    let innerText = '';
    while (innerText !== sanitizedText && this.elements.length > 0) {
      const lastElement = this.elements.pop();
      if (typeof lastElement?.content === 'string') {
        innerText = `${lastElement.content}${innerText}`;

        children.unshift(lastElement);
      }
    }

    this.elements.push(new Md.ParagraphElement(children));

    return text;
  }

  table(_header: string, _body: string) {
    return '';
  }

  tablerow(_content: string) {
    return '';
  }

  tablecell(
    _content: string,
    _flags: {
      header: boolean;
      align: 'center' | 'left' | 'right' | null;
    },
  ) {
    return '';
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

  codespan(_code: string) {
    return '';
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
      const lastElement = this.elements.pop();
      if (typeof lastElement?.content === 'string') {
        innerText = `${lastElement.content}${innerText}`;

        children.unshift(lastElement);
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
      const lastElement = this.elements.pop();
      if (typeof lastElement?.content === 'string') {
        innerText = `${lastElement.content}${innerText}`;

        children.unshift(lastElement);
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
    this.imagesToLoad.push((...args) => imgEl.load(...args));

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