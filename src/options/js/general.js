import defaultOptions from "../../utils/default-options.js";
import { byId, onlyNumber, onlyShorcut } from "../../utils/element.js";
import { getAllOptions, numOr, saveOptions, strOr, showInfo } from "./utils.js";

/**
 * @type {{
 *     accessKey: HTMLInputElement,
 *     allowText: HTMLInputElement,
 *     triggerOnSelection: HTMLInputElement,
 *     triggerSelectionTime: HTMLInputElement,
 *     alertMaxSelectionEnabled: HTMLInputElement,
 *     alertMaxSelectionLength: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
  accessKey: byId("accessKey"),
  allowText: byId("allowText"),
  triggerOnSelection: byId("triggerOnSelection"),
  triggerSelectionTime: byId("triggerSelectionTime"),
  alertMaxSelectionEnabled: byId("alertMaxSelectionEnabled"),
  alertMaxSelectionLength: byId("alertMaxSelectionLength"),
  save: byId("save"),
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    onlyShorcut(el.accessKey);
    onlyNumber(el.triggerSelectionTime, true);
    onlyNumber(el.alertMaxSelectionLength, false);
    await setFieldsValues(false);
  } catch (error) {
    console.error(error);
  }
});

el.save.addEventListener("click", async () => {
  try {
    /** @type {Options} */
    const options = {
      accessKey: strOr(el.accessKey.value, defaultOptions.accessKey),
      allowText: el.allowText.checked,
      triggerOnSelection: el.triggerOnSelection.checked,
      triggerSelectionTime: numOr(
        el.triggerSelectionTime.value,
        defaultOptions.triggerSelectionTime,
        1,
        1000000000,
      ),
      alertMaxSelectionEnabled: el.alertMaxSelectionEnabled.checked,
      alertMaxSelectionLength: numOr(
        el.alertMaxSelectionLength.value,
        defaultOptions.alertMaxSelectionLength,
        1,
        1000000000,
      ),
    };
    await saveOptions(options);
    await setFieldsValues();
    showInfo("General settings saved");
  } catch (error) {
    console.error(error);
  }
});

/**
 * @param {boolean} shouldSendMessage
 * @returns {Promise<void>}
 */
async function setFieldsValues(shouldSendMessage = true) {
  /** @type {Options} */
  const opt = await getAllOptions();
  el.accessKey.value = opt.accessKey;
  el.allowText.checked = opt.allowText;
  el.triggerOnSelection.checked = opt.triggerOnSelection;
  el.triggerSelectionTime.value = opt.triggerSelectionTime.toString();
  el.alertMaxSelectionEnabled.checked = opt.alertMaxSelectionEnabled;
  el.alertMaxSelectionLength.value = opt.alertMaxSelectionLength.toString();
  if (shouldSendMessage) {
    const tabs = await browser.tabs.query({
      url: ["https://*/*", "http://*/*"],
    });
    /** @type {ClientMessage} */
    const changeAlertMaxSelectionOptionsMessage = {
      target: "client",
      type: "changeAlertMaxSelectionOptions",
      origin: "other",
      changeAlertMaxSelectionOptions: {
        enabled: opt.alertMaxSelectionEnabled,
        maxLength: opt.alertMaxSelectionLength,
      },
    };
    await Promise.allSettled(
      tabs.map((t) =>
        browser.tabs.sendMessage(t.id, changeAlertMaxSelectionOptionsMessage),
      ),
    );
    /** @type {ClientMessage} */
    const setTriggerOnSelectionMessage = {
      target: "client",
      type: "setTriggerOnSelection",
      origin: "other",
      setTriggerOnSelection: {
        enabled: opt.triggerOnSelection,
        triggerTime: opt.triggerSelectionTime,
      },
    };
    await Promise.allSettled(
      tabs.map((t) =>
        browser.tabs.sendMessage(t.id, setTriggerOnSelectionMessage),
      ),
    );
  }
}
