import { css, type Handle, type MixInput, type RemixNode } from "remix/ui";
import { Document } from "./document.tsx";
import Header from "./Header.tsx";

export function Layout(handle: Handle<{ children: RemixNode; head?: RemixNode; mix?: MixInput }>) {
  const { mix, head } = handle.props;
  return () => (
    <Document head={head}>
      <Header />
      <div
        mix={[
          css({
            maxWidth: "960px",
            width: "100%",
            paddingInline: "1rem",
            marginInline: "auto",
            marginBlock: "4rem",
          }),
          mix,
        ]}
      >
        {handle.props.children}
      </div>
    </Document>
  );
}
