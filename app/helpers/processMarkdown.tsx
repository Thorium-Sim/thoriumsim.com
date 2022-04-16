import React, {lazy, ReactNode, Suspense, useEffect, useState} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {SpecialComponents} from "react-markdown/lib/ast-to-react.js";
import {NormalComponents} from "react-markdown/lib/complex-types";
// import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import ClientOnly from "~/components/ClientOnly";

const syntaxTheme = {
  'code[class*="language-"]': {
    color: "#c5c8c6",
    textShadow: "0 1px rgba(0, 0, 0, 0.3)",
    fontFamily:
      "Inconsolata, Monaco, Consolas, 'Courier New', Courier, monospace",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    lineHeight: "1.5",
    MozTabSize: "4",
    OTabSize: "4",
    tabSize: "4",
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#c5c8c6",
    textShadow: "0 1px rgba(0, 0, 0, 0.3)",
    fontFamily:
      "Inconsolata, Monaco, Consolas, 'Courier New', Courier, monospace",
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    lineHeight: "1.5",
    MozTabSize: "4",
    OTabSize: "4",
    tabSize: "4",
    WebkitHyphens: "none",
    MozHyphens: "none",
    msHyphens: "none",
    hyphens: "none",
    padding: "0",
    margin: "0",
    overflow: "auto",
    borderRadius: "0.3em",
    background: "transparent",
  },
  ':not(pre) > code[class*="language-"]': {
    background: "#1d1f21",
    padding: ".1em",
    borderRadius: ".3em",
  },
  comment: {
    color: "#7C7C7C",
  },
  prolog: {
    color: "#7C7C7C",
  },
  doctype: {
    color: "#7C7C7C",
  },
  cdata: {
    color: "#7C7C7C",
  },
  punctuation: {
    color: "#c5c8c6",
  },
  ".namespace": {
    Opacity: ".7",
  },
  property: {
    color: "#96CBFE",
  },
  keyword: {
    color: "#96CBFE",
  },
  tag: {
    color: "#96CBFE",
  },
  "class-name": {
    color: "#FFFFB6",
    textDecoration: "underline",
  },
  boolean: {
    color: "#99CC99",
  },
  constant: {
    color: "#99CC99",
  },
  symbol: {
    color: "#f92672",
  },
  deleted: {
    color: "#f92672",
  },
  number: {
    color: "#FF73FD",
  },
  selector: {
    color: "#A8FF60",
  },
  "attr-name": {
    color: "#A8FF60",
  },
  string: {
    color: "#A8FF60",
  },
  char: {
    color: "#A8FF60",
  },
  builtin: {
    color: "#A8FF60",
  },
  inserted: {
    color: "#A8FF60",
  },
  variable: {
    color: "#C6C5FE",
  },
  operator: {
    color: "#EDEDED",
  },
  entity: {
    color: "#FFFFB6",
    cursor: "help",
  },
  url: {
    color: "#96CBFE",
  },
  ".language-css .token.string": {
    color: "#87C38A",
  },
  ".style .token.string": {
    color: "#87C38A",
  },
  atrule: {
    color: "#F9EE98",
  },
  "attr-value": {
    color: "#F9EE98",
  },
  function: {
    color: "#DAD085",
  },
  regex: {
    color: "#E9C062",
  },
  important: {
    color: "#fd971f",
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
};
const defaultComponents: Partial<
  Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
> = {
  // code({node, inline, className, children, ref, ...props}) {
  //   const match = /language-(\w+)/.exec(className || "");
  //   return !inline && match ? (
  //     <SyntaxHighlighter
  //       children={String(children).replace(/\n$/, "")}
  //       style={syntaxTheme}
  //       language={match[1]}
  //       PreTag="div"
  //       {...props}
  //     />
  //   ) : (
  //     <code className={className} {...props}>
  //       {children}
  //     </code>
  //   );
  // },
};

const ReactMarkdown = lazy(() => import("react-markdown"));
export function Markdown({
  input,
  components,
}: {
  input: string;
  components?: Partial<
    Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
  >;
}): JSX.Element | null {
  const [modules, setModules] = useState<any[] | null>(null);
  useEffect(() => {
    (async function loadModules() {
      setModules(
        await Promise.all([
          import("remark-gfm").then(res => res.default),
          import("rehype-raw").then(res => res.default),
        ])
      );
    })();
  }, []);
  if (!modules) return null;
  const [remarkGfm, rehypeRaw] = modules;
  return (
    <ClientOnly>
      <Suspense fallback={null}>
        <ReactMarkdown
          components={{...defaultComponents, ...components}}
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
        >
          {input}
        </ReactMarkdown>
      </Suspense>
    </ClientOnly>
  );
}

export async function processMarkdown(
  input: string,
  components: Partial<
    Omit<NormalComponents, keyof SpecialComponents> & SpecialComponents
  > = {}
) {
  const {VFile} = await import("vfile");
  const {unified} = await import("unified");
  const {default: remarkParse} = await import("remark-parse");
  const {default: remarkRehype} = await import("remark-rehype");
  const {default: remarkGfm} = await import("remark-gfm");
  const {default: rehypeRaw} = await import("rehype-raw");
  const {html} = await import("property-information");

  const {childrenToReact} = await import("react-markdown/lib/ast-to-react.js");
  const {default: rehypeFilter} = await import(
    "react-markdown/lib/rehype-filter.js"
  );
  const remarkPlugins = [remarkGfm];
  const rehypePlugins = [rehypeRaw];
  const processor = unified()
    .use(remarkParse)

    .use(remarkPlugins)
    .use(remarkRehype, {allowDangerousHtml: true})
    .use(rehypePlugins)
    .use(rehypeFilter, {});
  const file = new VFile();
  file.value = input;
  const hastNode = await processor.run(processor.parse(file) as any);
  let element = React.createElement(
    React.Fragment,
    {},
    childrenToReact(
      {
        options: {components: {...defaultComponents, ...components}},
        schema: html,
        listDepth: 0,
      },
      hastNode
    )
  );
  const output = renderToStaticMarkup(element);
  return output;
}
