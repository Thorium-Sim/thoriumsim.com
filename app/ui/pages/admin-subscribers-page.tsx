import { css, type Handle } from "remix/ui";
import { AdminLayout } from "../adminLayout.tsx";

export function AdminSubscribersPage(
  handle: Handle<{
    subscribers: {
      created_at: unknown;
      email: string;
      status: string;
      subscriber_id: number;
    }[];
  }>,
) {
  return () => {
    return (
      <AdminLayout>
        <table mix={css({ minWidth: "100%" })}>
          <thead>
            <tr>
              <th mix={[cellStyle, headingStyle]}>Email</th>
              <th mix={[cellStyle, headingStyle]}>Status</th>
              <th mix={[cellStyle, headingStyle]}>Created At</th>
            </tr>
          </thead>
          <tbody>
            {handle.props.subscribers.map(({ subscriber_id, status, email, created_at }) => (
              <tr key={subscriber_id}>
                <td mix={cellStyle}>{email}</td>
                <td mix={cellStyle}>{status}</td>
                <td mix={cellStyle}>{new Date(created_at as number).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminLayout>
    );
  };
}

const cellStyle = css({
  paddingInline: "1.5rem",
  paddingBlock: "0.75rem",
});

const headingStyle = css({
  fontSize: "0.75rem",
  textAlign: "left",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});
