import {UploadData} from "./types";

const authorizeAccount = async () => {
  const keys = Buffer.from(
    `${process.env.B2_KEY_ID}:${process.env.B2_KEY_SECRET}`
  ).toString("base64");
  const response = await (
    await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
      headers: {Authorization: `Basic ${keys}`},
    })
  ).json();
  return response as {apiUrl: string; authorizationToken: string};
};

export const getUploadUrl = async () => {
  const {apiUrl, authorizationToken} = await authorizeAccount();
  const response = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: {Authorization: authorizationToken},
    body: JSON.stringify({bucketId: process.env.B2_BUCKET}),
  }).then(res => res.json());
  return response as UploadData;
};
