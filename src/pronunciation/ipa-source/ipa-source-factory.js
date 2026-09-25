import ISTranslatorMind from "./istranslatormind.js";
import ISCambridge from "./iscambridge.js";
import ISUnalengua from "./isunalengua.js";
import ISOxford from "./isoxford.js";

export const ipaSourceName2class = {
  translatorMind: ISTranslatorMind,
  cambridge: ISCambridge,
  unalengua: ISUnalengua,
  oxford: ISOxford,
};

/**
 * @param {string} source
 * @param {PronunciationSourceParams} params
 * @returns {PronunciationSource}
 */
export function ipaSourceFactory(source, params) {
  if (source in ipaSourceName2class) {
    return new ipaSourceName2class[source](params);
  }
  throw new Error(`Invalid IPA source: ${source}!`);
}

