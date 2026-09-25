import ASUnrealSpeech from "./asunrealspeech.js";
import ASDeepSeek from "./asdeepseek.js";
import ASAmazonPolly from "./asamazonpolly.js";
import ASElevenLabs from "./aselevenlabs.js";
import ASGstatic from "./asgstatic.js";
import ASResponsiveVoice from "./asresponsivevoice.js";
import ASPlayHt from "./asplayht.js";
import ASSpeechify from "./asspeechify.js";
import ASLinguee from "./aslinguee.js";
import ASCambridge from "./ascambridge.js";
import ASOpenAi from "./asopenai.js";
import ASGoogleSpeech from "./asgooglespeech.js";
import ASOxford from "./asoxford.js";

export const audioSourceName2class = {
  unrealSpeech: ASUnrealSpeech,
  deepSeek: ASDeepSeek,
  amazonPolly: ASAmazonPolly,
  elevenLabs: ASElevenLabs,
  gstatic: ASGstatic,
  responsiveVoice: ASResponsiveVoice,
  playHt: ASPlayHt,
  speechify: ASSpeechify,
  linguee: ASLinguee,
  cambridge: ASCambridge,
  openAi: ASOpenAi,
  googleSpeech: ASGoogleSpeech,
  oxford: ASOxford,
};

/**
 * @param {string} sourceName
 * @param {PronunciationSourceParams} params
 * @returns {PronunciationSource}
 */
export function audioSourceFactory(sourceName, params) {
  if (sourceName in audioSourceName2class) {
    return new audioSourceName2class[sourceName](params);
  }
  throw new Error(`Invalid audio source: ${sourceName}!`);
}

