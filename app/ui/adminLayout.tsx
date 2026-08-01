import { css, type Handle, type MixInput, type RemixNode } from "remix/ui";
import { Document } from "./document.tsx";
import { routes } from "../routes.ts";

export function AdminLayout(
  handle: Handle<{ children: RemixNode; head?: RemixNode; mix?: MixInput }>,
) {
  const { head } = handle.props;
  return () => (
    <Document head={head}>
      <div
        mix={css({
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          height: "100%",
          minHeight: "100vh",
          position: "relative",
        })}
      >
        <div
          mix={css({
            background: "oklch(0.0932 0.1123 311.94)",
            height: "100%",
            paddingInline: "1rem",
            paddingBlock: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            position: "sticky",
            top: "0px",
          })}
        >
          <a href={routes.admin.index.href()}>Dashboard</a>
          <a href={routes.admin.subscribers.href()}>Subscribers</a>
          <a href={routes.admin.newsletters.href()}>Newsletters</a>
        </div>
        <div mix={css({ padding: "2rem" })}>{handle.props.children}</div>
      </div>
    </Document>
  );
}
