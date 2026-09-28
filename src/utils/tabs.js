import { buffer2base64 } from "./element.js";
import { sleep } from "./promise.js";

/**
 * @param {browser.tabs._CreateCreateProperties} properties
 * @returns {Promise<browser.tabs.Tab>}
 */
export async function createTab(properties) {
  const tab = await browser.tabs.create(properties);
  const isCompleted = new Promise((resolve) => {
    /** @type {( tabId: number, changeInfo: browser.tabs._OnUpdatedChangeInfo, tab: browser.tabs.Tab ) => void} */
    const listener = async (tabId, changeInfo, tab) => {
      if (tabId === tab.id && changeInfo.status === "complete") {
        browser.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };
    browser.tabs.onUpdated.addListener(listener);
  });
  await isCompleted;
  return tab;
}

/**
 * @param {browser.tabs._CreateCreateProperties} properties
 * @param {"audio/mpeg" | "audio/ogg" | "text/html"} mimeType
 * @returns {Promise<string>}
 */
export async function createTabAndGetData(
  properties,
  mimeType = "audio/mpeg",
) {
  const urls = [properties.url];
  let tabId = 0;

  const responseBase64 = new Promise((resolve, reject) => {
    /** @type {ArrayBuffer[]} */
    const chunks = [];

    /** @type {(details: browser.webRequest._OnBeforeRequestDetails) => browser.webRequest.BlockingResponse} */
    const onBeforeRequest = (details) => {
      if (details.tabId !== tabId) {
        return {};
      }
      browser.webRequest.onBeforeRequest.removeListener(onBeforeRequest);
      const filter = browser.webRequest.filterResponseData(details.requestId);

      filter.ondata = ({ data }) => {
        chunks.push(data);
        filter.write(data);
      };

      filter.onstop = () => {
        filter.close();
        const totalLength = chunks.reduce((total, chunk) => {
          return total + chunk.byteLength;
        }, 0);
        const joinedChunks = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          joinedChunks.set(new Uint8Array(chunk), offset);
          offset += chunk.byteLength;
        }
        if (mimeType.startsWith("text")) {
          resolve(new TextDecoder("utf-8").decode(joinedChunks));
        } else {
          const base64 = `data:${mimeType};base64,${buffer2base64(joinedChunks)}`;
          resolve(base64);
        }
      };

      filter.onerror = ({ error }) => {
        reject(error ?? { status: 520, message: "Unknown error" });
      };

      return {};
    };

    browser.webRequest.onBeforeRequest.addListener(onBeforeRequest, { urls }, [
      "blocking",
    ]);
  });

  const responseCompletion = new Promise((resolve, reject) => {
    /** @type {(details: browser.webRequest._OnCompletedDetails) => Promise<void>} */
    const onCompleted = async (details) => {
      if (details.tabId !== tabId) {
        return;
      }
      browser.webRequest.onCompleted.removeListener(onCompleted);
      browser.webRequest.onErrorOccurred.removeListener(onErrorOccurred);
      if (details.statusCode === 404) {
        return reject({ status: 404, message: "Not found!" });
      }
      if (details.statusCode === 403) {
        await browser.tabs.update(tabId, { active: true });
        await sleep(5000);
        return reject({ status: 403, message: "Needs permission!" });
      }
      if (details.statusCode !== 200) {
        return reject({
          status: details.statusCode,
          message: "Another error!",
        });
      }
      resolve();
    };

    /** @type {(details: browser.webRequest._OnErrorOccurredDetails) => void} */
    const onErrorOccurred = (details) => {
      if (details.tabId !== tabId) {
        return;
      }
      browser.webRequest.onCompleted.removeListener(onCompleted);
      browser.webRequest.onErrorOccurred.removeListener(onErrorOccurred);
      reject(details.error);
    };

    browser.webRequest.onCompleted.addListener(onCompleted, { urls }, [
      "responseHeaders",
    ]);
    browser.webRequest.onErrorOccurred.addListener(onErrorOccurred, {
      urls,
    });
  });

  const tab = await browser.tabs.create(properties);
  tabId = tab.id;
  try {
    await responseCompletion;
    return await responseBase64;
  } finally {
    await browser.tabs.remove(tabId);
  }
}

/**
 * @param {number} tabId
 * @param {ClientMessage} message
 * @returns {Promise<any>}
 */
export async function sendClientMessage(tabId, message) {
  const [result, error] = await browser.tabs.sendMessage(tabId, message);
  if (error) {
    throw error;
  }
  return result;
}
