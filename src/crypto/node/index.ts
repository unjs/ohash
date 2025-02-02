import { createHash } from "node:crypto";

export { murmurHash } from "../js/murmur";

export function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex").replace(/=+$/, "");
}

export function sha256base64(date: string): string {
  return createHash("sha256")
    .update(date)
    .digest("base64")
    .replace(/[+/=]/g, "");
}
