import type { ImgRemoteRequestor } from './markdown/elements/Img';
import type { RenderOptions } from './markdown/types';

export type MarginOption = Partial<Record<'top' | 'left' | 'bottom' | 'right', number>>;

export type PluginOptions = RenderOptions & {
  /**
   * The method used to fetch images
   */
  remoteRequestor?: ImgRemoteRequestor;
  /**
   * The folder where to find local images
   */
  assetDir?: string;
  /**
   * Margin between markdown and limit of page
   */
  margin?: number | MarginOption;
  /**
   * Logger used by parser to send not critical messages
   */
  logger?: Console;
};

declare module 'jspdf' {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface jsPDF {
    /**
     * Render given Markdown into current jsPDF instance
     *
     * @param this The jsPDF instance
     * @param md The markdown to render
     * @param opts Options for plugin and for render
     */
    mdToPDF: (this: jsPDF, md: string, opts?: PluginOptions) => Promise<jsPDF>;
  }
}
