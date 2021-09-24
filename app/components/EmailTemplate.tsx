import {Fragment} from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {processMarkdown} from "~/helpers/processMarkdown";

const components = {
  ul: ({children}: any) => <Fragment children={children} />,
  ol: ({children}: any) => <Fragment children={children} />,
  li: ({children, ...props}: any) => (
    <Fragment>
      &bull; {children} <br />
    </Fragment>
  ),
  strong: (props: any) => <b {...props}></b>,
  em: (props: any) => <i {...props}></i>,
  h1: (props: any) => (
    <h1
      {...props}
      style={{
        lineHeight: 1.66,
        color: "#111111",
        fontWeight: 900,
        fontSize: "24px",
      }}
    ></h1>
  ),
  h2: (props: any) => (
    <h2
      {...props}
      style={{
        lineHeight: 1.66,
        color: "#111111",
        fontWeight: 900,
        fontSize: "22px",
      }}
    ></h2>
  ),
  h3: (props: any) => (
    <h3
      {...props}
      style={{
        lineHeight: 1.66,
        color: "#111111",
        fontWeight: 900,
        fontSize: "20px",
      }}
    ></h3>
  ),
  h4: (props: any) => (
    <h4
      {...props}
      style={{
        lineHeight: 1.66,
        color: "#111111",
        fontWeight: 900,
        fontSize: "18px",
      }}
    ></h4>
  ),
  h5: (props: any) => (
    <h5
      {...props}
      style={{
        lineHeight: 1.66,
        color: "#111111",
        fontWeight: 900,
        fontSize: "16px",
      }}
    ></h5>
  ),
  h6: (props: any) => (
    <h6
      {...props}
      style={{
        lineHeight: 1.66,
        color: "#111111",
        fontWeight: 900,
        fontSize: "16px",
      }}
    ></h6>
  ),
  p: (props: any) => (
    <p
      {...props}
      style={{
        marginTop: 0,
        marginBottom: "24px",
        fontSize: "16px",
        lineHeight: "1.5",
        fontFamily: "Geneva",
        color: "#131313",
      }}
    />
  ),
  a: (props: any) => <a {...props} style={{color: "#0875c1"}} rel="nofollow" />,
  img: (props: any) => (
    <img
      {...props}
      style={{
        border: "0 none",
        display: "block",
        lineHeight: "100%",
        outline: "none",
        WebkitTextDecoration: "none",
        textDecoration: "none",
        maxWidth: "520px",
        width: "520px",
      }}
    />
  ),
};

function EmailTemplate({
  input,
  email,
  broadcastId = 0,
}: {
  email: string;
  input: string;
  broadcastId: number;
}) {
  return (
    <table
      cellPadding={0}
      cellSpacing={0}
      style={{
        borderCollapse: "separate",
        backgroundColor: "#f1f1f1",
        width: "100%",
      }}
    >
      <tbody>
        <tr>
          <td style={{verticalAlign: "top"}} />
          <td style={{verticalAlign: "top"}}>
            <div
              style={{
                margin: "0 auto",
                padding: "30px 0",
                paddingLeft: "20px",
                paddingRight: "20px",
                maxWidth: "600px",
              }}
            >
              <div
                style={{
                  marginBottom: "20px",
                  backgroundColor: "#ffffff",
                  borderRadius: "0px",
                }}
              >
                <div
                  style={{
                    backgroundRepeat: "no-repeat",
                    minHeight: "300px",
                    padding: "20px",
                    backgroundImage:
                      'url("https://files.thoriumsim.com/file/thorium-public/storage/email-header.jpg")',
                    backgroundSize: "cover",
                  }}
                />
                <div
                  style={{padding: "20px"}}
                  dangerouslySetInnerHTML={{
                    __html: `${input}<img src="https://thoriumsim.com/email/trackingPixel?email=${email}&broadcastId=${broadcastId}"`,
                  }}
                ></div>
                <div style={{padding: "0 20px 20px 20px"}}>
                  <p
                    style={{
                      marginTop: 0,
                      marginBottom: "6px",
                      fontSize: "16px",
                      lineHeight: "1.5",
                      fontFamily: "Geneva",
                      color: "#131313",
                      textAlign: "left",
                    }}
                  >
                    ​
                    <a
                      href={`https://thoriumsim.com/email/unsubscribe?email=${email}`}
                      style={{color: "#0875c1"}}
                      rel="nofollow"
                    >
                      Unsubscribe
                    </a>{" "}
                    <br />
                    50 W Broadway Ste 333
                    <br />
                    PMB 51647
                    <br />
                    Salt Lake City, Utah 84101
                  </p>
                </div>
              </div>
            </div>
          </td>
          <td style={{verticalAlign: "top"}} />
        </tr>
      </tbody>
    </table>
  );
}

export default async function getEmailContent(
  input: string,
  email: string,
  broadcastId = 0
) {
  const content = await processMarkdown(input, components);
  return renderToStaticMarkup(
    <EmailTemplate input={content} email={email} broadcastId={broadcastId} />
  );
}
