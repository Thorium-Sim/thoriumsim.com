import randomWords from "random-words";

import {UploadData} from "./types";

export function saveImageHandler(
  uploadData: UploadData,
  filenamePrefix: string = "uploads"
) {
  const saveImage = async function* (data: ArrayBuffer) {
    const nameParts = randomWords(3);
    const name = Array.isArray(nameParts) ? nameParts.join("-") : nameParts;
    const image = new File([new Blob([data])], `${name}.png`, {
      type: "image/png",
    });
    const result = await fetch(uploadData.uploadUrl, {
      method: "POST",
      body: image,
      headers: {
        Authorization: uploadData.authorizationToken,
        "Content-Type": "b2/x-auto",
        "X-Bz-File-Name": `${filenamePrefix}/${image.name.replace(
          /\s/gm,
          "-"
        )}`,
        "X-Bz-Content-Sha1": "do_not_verify",
      },
    }).then(res => res.json());
    const {fileName} = result;
    const url = `https://files.thoriumsim.com/file/thorium-public/${fileName}`;
    yield url;
    // returns true meaning that the save was successful
    return true;
  };
  return saveImage;
}
