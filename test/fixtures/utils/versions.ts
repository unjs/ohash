// Based on: https://github.com/unjs/giget/blob/main/src/_utils.ts

import { createWriteStream, existsSync, renameSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { Agent } from "node:http";
import { homedir, tmpdir } from "node:os";
import { resolve } from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { serialize } from "../../../src";

export type VersionCode = `v${number}.${number}.${string}`;

export async function getVersions(array: VersionCode[]): Promise<
  Array<{
    name: string;
    serialize: (input: any, options?: Record<string, any>) => string;
  }>
> {
  const imports = await Promise.all(array.map((v) => getVersion(v)));
  const versions = array.map((version, i) => ({
    name: `ohash ${version}`,
    serialize: (input: any, options?: Record<string, any>) =>
      version.startsWith("v2")
        ? imports[i].serialize(input)
        : imports[i].objectHash(input, options),
  }));

  versions.push({
    name: "ohash @ dev",
    serialize: (input) => serialize(input),
  });

  return versions;
}

async function getVersion(version: VersionCode) {
  const cacheDir = cacheDirectory();

  if (!existsSync(cacheDir)) {
    await mkdir(cacheDir, { recursive: true });
  }

  const name = version.startsWith("v2") ? "serialize" : "object-hash";
  const filePath = resolve(cacheDirectory(), `${name}-${version}.ts`);

  await download(
    `https://raw.githubusercontent.com/unjs/ohash/refs/tags/${version}/src/${name}.ts`,
    filePath,
  );

  return import(filePath);
}

export async function download(
  url: string,
  filePath: string,
  options: { headers?: Record<string, string | undefined> } = {},
) {
  const infoPath = filePath + ".json";
  const info: { etag?: string } = JSON.parse(
    await readFile(infoPath, "utf8").catch(() => "{}"),
  );
  const headResponse = await sendFetch(url, {
    method: "HEAD",
    headers: options.headers,
  }).catch(() => undefined);
  const etag = headResponse?.headers.get("etag");
  if (info.etag === etag && existsSync(filePath)) {
    // Already downloaded
    return;
  }
  if (typeof etag === "string") {
    info.etag = etag;
  }

  const response = await sendFetch(url, { headers: options.headers });

  if (response.status >= 400) {
    throw new Error(
      `Failed to download ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const stream = createWriteStream(filePath);
  await promisify(pipeline)(response.body as any, stream);

  await writeFile(infoPath, JSON.stringify(info), "utf8");
}

interface InternalFetchOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string | undefined>;
  agent?: Agent;
  validateStatus?: boolean;
}

export async function sendFetch(
  url: string,
  options: InternalFetchOptions = {},
) {
  // https://github.com/nodejs/undici/issues/1305
  if (options.headers?.["sec-fetch-mode"]) {
    options.mode = options.headers["sec-fetch-mode"] as any;
  }

  const res = await fetch(url, {
    ...options,
    headers: normalizeHeaders(options.headers),
  }).catch((error: any) => {
    throw new Error(`Failed to download ${url}: ${error}`, { cause: error });
  });

  if (options.validateStatus && res.status >= 400) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }

  return res;
}

export function normalizeHeaders(
  headers: Record<string, string | undefined> = {},
) {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (!value) {
      continue;
    }
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

export function cacheDirectory() {
  const cacheDir = process.env.XDG_CACHE_HOME
    ? resolve(process.env.XDG_CACHE_HOME, "ohash")
    : resolve(homedir(), ".cache/ohash");

  if (process.platform === "win32") {
    const windowsCacheDir = resolve(tmpdir(), "ohash");
    // Migrate cache dir to new location
    // https://github.com/unjs/giget/pull/182/
    // TODO: remove in next releases
    if (!existsSync(windowsCacheDir) && existsSync(cacheDir)) {
      try {
        renameSync(cacheDir, windowsCacheDir);
      } catch {
        // ignore
      }
    }
    return windowsCacheDir;
  }

  return cacheDir;
}
