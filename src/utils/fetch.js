import { blob2base64 } from "./element.js";
import MemoryCache from "./memory-cache.js";

const documentCache = new MemoryCache("fetchDocumentCache", 6);

/**
 * @param {string} url
 * @param {string} credentials
 * @param {boolean} force
 * @returns {Promise<string>}
 */
export async function url2text(url, credentials = "omit", force = false) {
  /** @type {string | null} */
  let text = !force ? documentCache.get(url) : null;
  if (!text) {
    const response = await fetch(url, { credentials });
    const status = response.status;
    if (status !== 200) {
      const message = await response.text();
      /** @type {PronunciationSourceLastError} */
      const le = {
        status,
        message,
        messageContentType: response.headers.get("Content-Type"),
        error: new Error(response.statusText),
      };
      throw le;
    }
    text = await response.text();
    documentCache.set(url, text);
  }
  return text;
}

/**
 * @param {string} url
 * @param {string} credentials
 * @param {boolean} force
 * @returns {Promise<Document>}
 */
export async function url2document(url, credentials = "omit", force = false) {
  const text = await url2text(url, credentials, force);
  return new DOMParser().parseFromString(text, "text/html");
}

/**
 * @param {string} url
 * @returns {Promise<Blob>}
 */
export async function url2blob(url, credentials = "omit") {
  const response = await fetch(url, { credentials });
  const status = response.status;
  if (status !== 200) {
    const message = await response.text();
    /** @type {PronunciationSourceLastError} */
    const le = {
      status,
      message,
      messageContentType: response.headers.get("Content-Type"),
      error: new Error(response.statusText),
    };
    throw le;
  }
  const blob = await response.blob();
  return blob;
}

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function url2base64(url, credentials = "omit") {
  const blob = await url2blob(url, credentials);
  return blob2base64(blob);
}
