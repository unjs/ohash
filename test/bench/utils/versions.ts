// Based on: https://github.com/unjs/giget/blob/48493620f51307588bbf1010f1dbf64cd5b50fd3/src/_utils.ts

import { createWriteStream, existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { Agent } from "node:http";
import { homedir, tmpdir } from "node:os";
import { resolve } from "node:path";
import { pipeline } from "node:stream";
import { promisify } from "node:util";

/**
 * Supports:
 *  - version tags (v1 and v2)
 *  - branch names (v2 only)
 *  - full length commmit hashes (v2 only)
 */
export type VersionString =
  | "main"
  | `v${number}.${number}.${string}`
  | (string & {});

type Version = {
  name: string;
  serialize: (input: any, options?: Record<string, any>) => string;
  baseline: boolean;
};

export async function getVersions(array: VersionString[]): Promise<Version[]> {
  const imports = await Promise.all(array.map((v) => getVersion(v)));
  return array.map((version, i) => ({
    name: `ohash @ ${version.length === 40 ? version.slice(0, 7) : version}`,
    serialize:
      "objectHash" in imports[i] ? imports[i].objectHash : imports[i].serialize,
    baseline: false,
  }));
}

async function getVersion(version: VersionString) {
  const cacheDir = cacheDirectory();

  if (!existsSync(cacheDir)) {
    await mkdir(cacheDir, { recursive: true });
  }

  const name = version.startsWith("v1") ? "object-hash" : "serialize";
  const filePath = resolve(
    cacheDirectory(),
    `${name}-${version.replace(/\//g, "-")}.ts`,
  );
  const isTag = /^v[0-9]+\.[0-9]+\./.test(version);

  try {
    await download(
      `https://raw.githubusercontent.com/unjs/ohash${isTag ? "/refs/tags" : ""}/${version}/src/${name}.ts`,
      filePath,
    );
  } catch (error) {
    if (!existsSync(filePath)) {
      console.error(`${error}`);

      throw error;
    }

    console.warn(
      `Version "${version}" has been removed from GitHub, using cached version..`,
    );
  }

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
    return resolve(tmpdir(), "ohash");
  }

  return cacheDir;
}
