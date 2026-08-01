import { css, type Handle } from "remix/ui";
import { AdminLayout } from "../adminLayout.tsx";

export function AdminIndexPage(
  handle: Handle<{ active: number; pending: number; unsubscribed: number; users: number }>,
) {
  return () => (
    <AdminLayout>
      <div mix={css({ display: "flex", flexWrap: "wrap", gap: "1rem" })}>
        <div mix={cardStyle}>
          <h2 mix={headingStyle}>Active Subscribers</h2>
          <p mix={numberStyle}>{handle.props.active}</p>
        </div>
        <div mix={cardStyle}>
          <h2 mix={headingStyle}>Pending Subscribers</h2>
          <p mix={numberStyle}>{handle.props.pending}</p>
        </div>
        <div mix={cardStyle}>
          <h2 mix={headingStyle}>Unsubscribed</h2>
          <p mix={numberStyle}>{handle.props.unsubscribed}</p>
        </div>
        <div mix={cardStyle}>
          <h2 mix={headingStyle}>Users</h2>
          <p mix={numberStyle}>{handle.props.users}</p>
        </div>
      </div>
    </AdminLayout>
  );
}

const cardStyle = css({
  background: "oklch(0.1932 0.0523 311.94)",
  paddingBlock: "1rem",
  paddingInline: "2rem",
  borderRadius: "0.5rem",
});

const headingStyle = css({
  fontSize: "1rem",
});
const numberStyle = css({
  fontSize: "2rem",
  fontWeight: 700,
  margin: 0,
});
