import { css, type Handle } from "remix/ui";
import { AdminLayout } from "../adminLayout.tsx";

export function AdminNewslettersPage(
  handle: Handle<{
    newsletters: {
      post_id: number;
      publishDate: number;
      title: string;
      sendCount: number;
      openCount: number;
    }[];
  }>,
) {
  return () => {
    return (
      <AdminLayout>
        <table mix={css({ minWidth: "100%" })}>
          <thead>
            <tr>
              <th mix={[cellStyle, headingStyle]}>Title</th>
              <th mix={[cellStyle, headingStyle]}>Date</th>
              <th mix={[cellStyle, headingStyle]}>Send Count</th>
              <th mix={[cellStyle, headingStyle]}>Open Count</th>
              <th mix={[cellStyle, headingStyle]}>Open Rate</th>
            </tr>
          </thead>
          <tbody>
            {handle.props.newsletters.map(
              ({ openCount, post_id, publishDate, sendCount, title }) => (
                <tr key={post_id}>
                  <td mix={cellStyle}>{title}</td>
                  <td mix={cellStyle}>{new Date(publishDate as number).toLocaleDateString()}</td>
                  <td mix={cellStyle}>{sendCount}</td>
                  <td mix={cellStyle}>{openCount}</td>
                  <td mix={cellStyle}>
                    {" "}
                    {sendCount === 0 ? "N/A" : `${Math.round((openCount / sendCount) * 100)}%`}
                  </td>
                </tr>
              ),
            )}
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
