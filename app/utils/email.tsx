import { processMarkdown } from "./processMarkdown.ts";
import { renderToString } from "remix/ui/server";
import { AwsClient } from "aws4fetch";
import { getEnv } from "./env.ts";
import { RateLimiter } from "limiter";
const awsLimiter = new RateLimiter({ interval: "sec", tokensPerInterval: 70 });

const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SES_ENDPOINT, FROM_ADDRESS } = getEnv();

const sesEndpoint = AWS_SES_ENDPOINT || "email.us-east-1.amazonaws.com";
const defaultFromAddress = FROM_ADDRESS || "hey@thoriumsim.com";

const awsClient =
  AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY
    ? new AwsClient({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      })
    : null;

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo = [],
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text: string;
  from?: string;
  replyTo?: string[];
}) {
  if (!awsClient) {
    console.info("Mock Sending email", { to, subject, text, html });
    return;
  }
  await awsLimiter.removeTokens(1);

  await awsClient.fetch(`https://${sesEndpoint}/v2/email/outbound-emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Content: {
        Simple: {
          Subject: { Data: subject },
          Body: {
            ...(html
              ? {
                  Html: {
                    Data: html,
                  },
                }
              : null),
            Text: {
              Data: text,
            },
          },
        },
      },
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
      },
      ReplyToAddresses: replyTo,
      FromEmailAddress: from || defaultFromAddress,
    }),
  });
}

export async function getEmailContent(input: string, email: string, broadcastId = 0) {
  const content = await processMarkdown(input, {
    styles: {
      h1: {
        lineHeight: "1.66",
        color: "#111111",
        fontWeight: "900",
        fontSize: "24px",
      },
      h2: {
        lineHeight: "1.66",
        color: "#111111",
        fontWeight: "900",
        fontSize: "22px",
      },
      h3: {
        lineHeight: "1.66",
        color: "#111111",
        fontWeight: "900",
        fontSize: "20px",
      },
      h4: {
        lineHeight: "1.66",
        color: "#111111",
        fontWeight: "900",
        fontSize: "18px",
      },
      h5: {
        lineHeight: "1.66",
        color: "#111111",
        fontWeight: "900",
        fontSize: "16px",
      },
      h6: {
        lineHeight: "1.66",
        color: "#111111",
        fontWeight: "900",
        fontSize: "16px",
      },
      p: {
        marginTop: "0",
        marginBottom: "24px",
        fontSize: "16px",
        lineHeight: "1.5",
        fontFamily: "Geneva",
        color: "#131313",
      },
      a: { color: "#0875c1" },
      img: {
        border: "0 none",
        display: "block",
        lineHeight: "100%",
        outline: "none",
        WebkitTextDecoration: "none",
        textDecoration: "none",
        maxWidth: "520px",
        width: "520px",
      },
    },
  });
  const html = await renderToString(
    <table
      cellPadding="0"
      cellSpacing="0"
      style={{
        borderCollapse: "separate",
        backgroundColor: "#f1f1f1",
        width: "100%",
      }}
    >
      <tbody>
        <tr>
          <td style={{ verticalAlign: "top" }} />
          <td style={{ verticalAlign: "top" }}>
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
                    backgroundImage: 'url("https://assets.thoriumsim.com/email-header.jpg")',
                    backgroundSize: "cover",
                  }}
                />
                <div
                  style={{ padding: "20px" }}
                  innerHTML={`${content.html}<img src="https://thoriumsim.com/email/trackingPixel?email=${email}&broadcastId=${broadcastId}"/>`}
                ></div>
                <div style={{ padding: "0 20px 20px 20px" }}>
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
                      style={{ color: "#0875c1" }}
                      rel="nofollow"
                    >
                      Unsubscribe
                    </a>{" "}
                    <br />
                    120 E. Orem, UT 84057
                  </p>
                </div>
              </div>
            </div>
          </td>
          <td style={{ verticalAlign: "top" }} />
        </tr>
      </tbody>
    </table>,
  );

  return html;
}
