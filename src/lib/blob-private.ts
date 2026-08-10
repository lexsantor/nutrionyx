import { del, get, put } from "@vercel/blob";

/**
 * Private Blob store access (docs/build/slice-14-plan.md). The project's
 * default BLOB_READ_WRITE_TOKEN belongs to the public store (logos), so the
 * private store token is injected under the PRIVATE prefix.
 */
function token(): string {
  const value = process.env.PRIVATE_BLOB_READ_WRITE_TOKEN;
  if (!value) {
    throw new Error(
      "PRIVATE_BLOB_READ_WRITE_TOKEN missing - connect the nutrionyx-private store",
    );
  }
  return value;
}

export async function putPrivate(pathname: string, body: Blob | File) {
  return put(pathname, body, { access: "private", token: token() });
}

export async function getPrivate(pathname: string) {
  return get(pathname, { access: "private", token: token() });
}

export async function delPrivate(pathnames: string | string[]) {
  return del(pathnames, { token: token() });
}
