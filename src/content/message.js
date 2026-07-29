import { changeOptions as changeAlertMaxSelectionOptions } from "../utils/alert-max-selection.js";
import {
  addAudioSource,
  changeSkipSeconds,
  setAudioControlShortcuts,
  toggleAudioControlShortcuts,
  toggleAudioPlayer,
} from "../utils/audio-player.js";
import IpaPopup from "../utils/ipa-popup.js";
import { showPopup } from "../utils/show-popup.js";
import { optionsTable } from "../utils/storage-tables.js";

let triggerSelectionTime = 1000;

if (!browser.runtime.onMessage.hasListener(onMessage)) {
  browser.runtime.onMessage.addListener(onMessage);
}

/**
 * @param {ClientMessage} message
 * @param {browser.runtime.MessageSender} sender
 * @param {(any) => void} sendResponse
 * @returns {boolean}
 */
function onMessage(message, sender, sendResponse) {
  if (message.target !== "client") {
    return false;
  }
  const actions = {
    showIpa: showIpa,
    getSelectedText: getSelectedText,
    getIpaPosition: getIpaPosition,
    playAudio: playAudio,
    showPlayer: showPlayer,
    showPopup: showPopupFromBackground,
    changeAlertMaxSelectionOptions: changeAlertMaxSelectionOptionsCB,
    setTriggerOnSelection: setTriggerOnSelection,
  };
  if ((!message.type) in actions) {
    throw new Error(`Invalid message type: ${message.type}`);
  }
  actions[message.type](message).then(sendResponse).catch(console.error);
  return true;
}

/**
 * @param {ClientMessage} message
 * @returns {Promise<void>}
 */
async function showIpa(message) {
  const options = message.showIpa;
  if (!options) {
    throw new Error("Should pass showIpa options in message");
  }
  const popup = new IpaPopup(options.ipa, options.position, options.options);
  return popup.show();
}

/**
 * @param {ClientMessage} message
 * @returns {Promise<string>}
 */
async function getSelectedText(message) {
  return document.getSelection().toString();
}

/**
 * @param {ClientMessage} message
 * @returns {Promise<PopupPosition>}
 */
async function getIpaPosition(message) {
  const options = message.getIpaPosition;
  if (!options) {
    throw new Error("Should pass getIpaPosition options in message");
  }
  const scrollY = window.scrollY;
  const s = window.getSelection();
  if (s.rangeCount === 0) {
    return {
      centerHorizontally: true,
      centerVertically: true,
      scrollY,
    };
  }
  const { top, left } = s.getRangeAt(0).getBoundingClientRect();
  let shiftTimes = -1.9;
  const origin =
    message.origin == "menuItem"
      ? "menu"
      : message.origin == "action"
        ? "action"
        : message.origin == "command"
          ? "command"
          : "selection";
  if (options.optionPosition[`${origin}Triggered`] === "below") {
    shiftTimes = 2.5;
  }
  return {
    centerHorizontally: false,
    centerVertically: false,
    top: top + options.fontSize * shiftTimes,
    left,
    scrollY,
  };
}

/**
 * @param {ClientMessage} message
 * @returns {Promise<void>}
 */
async function playAudio(message) {
  const options = message.playAudio;
  if (!options) {
    throw new Error("Should pass playAudio options in message");
  }
  try {
    setAudioControlShortcuts(options.shortcuts);
    toggleAudioControlShortcuts({
      forceEnable: options.shortcutsEnabled,
      forceDisable: !options.shortcutsEnabled,
    });
    changeSkipSeconds(options.skipSeconds);
    if (options.source) {
      await addAudioSource(options.source, { play: true });
      await toggleAudioPlayer({
        forceEnable: options.playerEnabled,
        forceDisable: !options.playerEnabled,
      });
    } else if (!options.playerEnabled) {
      await toggleAudioPlayer({ forceDisable: true });
    }
  } catch (error) {
    toggleAudioControlShortcuts({ forceDisable: true });
    await toggleAudioPlayer({ forceDisable: true });
    console.error(error);
  }
}

/**
 * @param {ClientMessage} message
 * @returns {Promise<void>}
 */
async function showPlayer(message) {
  try {
    await toggleAudioPlayer({ forceEnable: true });
  } catch (error) {
    toggleAudioControlShortcuts({ forceDisable: true });
    await toggleAudioPlayer({ forceDisable: true });
    console.error(error);
  }
}

/**
 * @param {ClientMessage} message
 * @returns {Promise<void>}
 */
async function showPopupFromBackground(message) {
  const options = message.showPopup;
  if (!options) {
    throw new Error("Should pass showPopup options in message");
  }
  showPopup(options);
}

/**
 * @param {ClientMessage} message
 * @returns {Promise<void>}
 */
async function changeAlertMaxSelectionOptionsCB(message) {
  const options = message.changeAlertMaxSelectionOptions;
  if (!options) {
    throw new Error(
      "Should pass changeAlertMaxSelectionOptionsoptions in message",
    );
  }
  changeAlertMaxSelectionOptions(options);
}

/**
 * @param {ClientMessage} message
 * @returns {Promise<void>}
 */
async function setTriggerOnSelection(message) {
  const options = message.setTriggerOnSelection;
  if (!options) {
    throw new Error("Should pass setTriggerOnSelection in message");
  }
  document.removeEventListener("selectionchange", selectionChangeListener);
  if (options.enabled) {
    document.addEventListener("selectionchange", selectionChangeListener);
  }
  if (options.triggerTime) {
    triggerSelectionTime = options.triggerTime;
  }
}

let checkingSelectionChangeTextAfter = false;
function selectionChangeListener() {
  if (window.getSelection().isCollapsed || checkingSelectionChangeTextAfter) {
    return;
  }
  let textBefore = window.getSelection().toString();
  checkingSelectionChangeTextAfter = true;
  const intervalId = setInterval(async () => {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
      clearInterval(intervalId);
      checkingSelectionChangeTextAfter = false;
      return;
    }
    const textAfter = selection.toString();
    if (textBefore !== textAfter) {
      textBefore = textAfter;
      return;
    }
    clearInterval(intervalId);
    checkingSelectionChangeTextAfter = false;
    /** @type {BackgroundMessage} */
    const message = {
      target: "background",
      type: "pronounce",
      pronounce: {
        text: textAfter,
      },
    };
    await browser.runtime.sendMessage(message);
  }, triggerSelectionTime);
}

(async () => {
  /** @type {Options} */
  const options = await optionsTable.getAll();
  await setTriggerOnSelection({
    setTriggerOnSelection: {
      enabled: options.triggerOnSelection,
      triggerTime: options.triggerSelectionTime,
    },
  });
  changeAlertMaxSelectionOptions({
    enabled: options.alertMaxSelectionEnabled,
    maxLength: options.alertMaxSelectionLength,
  });
})().catch(console.error);
