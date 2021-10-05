import {createHash} from "crypto";
export function md5(str: string) {
  return createHash("md5").update(str).digest("hex");
}
