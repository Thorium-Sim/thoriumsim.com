/*!
 * Forked from https://github.com/remix-run/remix-website/blob/main/app/data/md.ts
 *
 * Adapted from
 * - ggoodman/nostalgie
 *   - MIT https://github.com/ggoodman/nostalgie/blob/45f3f6356684287a214dab667064ec9776def933/LICENSE
 *   - https://github.com/ggoodman/nostalgie/blob/45f3f6356684287a214dab667064ec9776def933/src/worker/mdxCompiler.ts
 */
import type * as Unist from "unist";
import type * as Unified from "unified";
import type { Root, Element } from "hast";

interface ProcessorOptions {
  resolveHref?(href: string): string;
  styles?: StyleMap;
  plain?: boolean;
}

let processor: Awaited<ReturnType<typeof getProcessor>>;
export async function processMarkdown(raw: string, options?: ProcessorOptions) {
  processor = processor || (await getProcessor(options));
  let vfile;
  if (options?.styles) {
    vfile = await (await getProcessor(options)).process(raw);
  } else if (options?.plain) {
    vfile = await (await getPlainProcessor()).process(raw);
  } else {
    vfile = await processor.process(raw);
  }
  let html = vfile.value.toString();
  return { raw, html };
}

async function getProcessor(options?: ProcessorOptions) {
  let [
    { unified },
    { default: remarkGfm },
    { default: remarkParse },
    { default: remarkRehype },
    { default: rehypeSlug },
    { default: rehypeStringify },
    { default: rehypeAutolinkHeadings },
    plugins,
  ] = await Promise.all([
    import("unified"),
    import("remark-gfm"),
    import("remark-parse"),
    import("remark-rehype"),
    import("rehype-slug"),
    import("rehype-stringify"),
    import("rehype-autolink-headings"),
    loadPlugins(),
  ]);

  return unified()
    .use(remarkParse)
    .use(plugins.stripLinkExtPlugin, options)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(plugins.rehypeInlineStyles, options?.styles || {});
}

async function getPlainProcessor() {
  let [{ unified }, { default: remarkParse }, { default: strip }, { default: rehypeStringify }] =
    await Promise.all([
      import("unified"),
      import("remark-parse"),
      import("strip-markdown"),
      import("remark-stringify"),
    ]);

  return unified()
    .use(remarkParse)
    .use(strip, {
      remove: [
        [
          "link",
          (node) => ({
            type: "text",
            value: `${node.children[0].value} (${node.url})`,
            position: node.position,
          }),
        ],
      ],
    })
    .use(rehypeStringify);
}

type InternalPlugin<Input extends string | Unist.Node | undefined, Output> = Unified.Plugin<
  [ProcessorOptions?],
  Input,
  Output
>;

async function loadPlugins() {
  let { visit, SKIP } = await import("unist-util-visit");

  const stripLinkExtPlugin: InternalPlugin<UnistNode.Root, UnistNode.Root> = (options = {}) => {
    return async function transformer(tree: UnistNode.Root) {
      visit(tree, "link", (node, index, parent) => {
        if (options.resolveHref && typeof node.url === "string" && isRelativeUrl(node.url)) {
          if (parent && index != null) {
            parent.children[index] = {
              ...node,
              url: options.resolveHref(node.url),
            };
            return SKIP;
          }
        }
      });
    };
  };

  function rehypeInlineStyles(styles: StyleMap) {
    return (tree: Root) => {
      visit(tree, "element", (node: Element) => {
        const key = node.tagName;
        if (!key) return;

        const newStyles = styles[key];
        if (!newStyles) return;

        node.properties = node.properties || {};

        node.properties.style = toCssText(newStyles);
      });
    };
  }

  return {
    stripLinkExtPlugin,
    rehypeInlineStyles,
  };
}

function isRelativeUrl(test: string) {
  // Probably fragile but should work well enough.
  // It would be nice if the consumer could provide a baseURI we could do
  // something like:
  // new URL(baseURI).origin === new URL(test, baseURI).origin
  let regexp = new RegExp("^(?:[a-z]+:)?//", "i");
  return !regexp.test(test);
}

////////////////////////////////////////////////////////////////////////////////

namespace UnistNode {
  export type Content = Flow | Phrasing | Html;
  export interface Root extends Unist.Parent {
    type: "root";
    children: Flow[];
  }

  export type Flow =
    | Blockquote
    | Heading
    | ParagraphNode
    | Link
    | Pre
    | Code
    | Image
    | Element
    | Html;

  export interface Html extends Unist.Node {
    type: "html";
    value: string;
  }

  export interface Element extends Unist.Parent {
    type: "element";
    tagName?: string;
  }

  export interface CodeElement extends Element {
    tagName: "code";
    data?: {
      meta?: string;
    };
    properties?: {
      className?: string[];
    };
  }

  export interface PreElement extends Element {
    tagName: "pre";
  }

  export interface Image extends Unist.Node {
    type: "image";
    title: null;
    url: string;
    alt?: string;
  }

  export interface Blockquote extends Unist.Parent {
    type: "blockquote";
    children: Flow[];
  }

  export interface Heading extends Unist.Parent {
    type: "heading";
    depth: number;
    children: UnistNode.Phrasing[];
  }

  interface ParagraphNode extends Unist.Parent {
    type: "paragraph";
    children: Phrasing[];
  }

  export interface Pre extends Unist.Parent {
    type: "pre";
    children: Phrasing[];
  }

  export interface Code extends Unist.Parent {
    type: "code";
    value?: string;
    meta?: string | string[];
  }

  export type Phrasing = Text | Emphasis;

  export interface Emphasis extends Unist.Parent {
    type: "emphasis";
    children: Phrasing[];
  }

  export interface Link extends Unist.Parent {
    type: "link";
    children: Flow[];
    url?: string;
  }

  export interface Text extends Unist.Literal {
    type: "text";
    value: string;
  }
}

type StyleMap = Record<string, Record<string, string>>;

function camelToKebab(prop: string): string {
  return /[A-Z]/.test(prop) && !prop.includes("-")
    ? prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
    : prop;
}

function toCssText(styles: Record<string, string>): string {
  return Object.entries(styles)
    .map(([prop, value]) => `${camelToKebab(prop)}: ${value}`)
    .join("; ");
}
