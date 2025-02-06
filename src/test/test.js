import * as af from "../audio-from.js";

console.log("audioFrom test start");

(async() => {
	const word = "literally";
	console.log("\n".repeat(3));
	for (const [name, fn] of [
		// ["audioFromGstatic", af.audioFromGstatic],
		// ["audioFromOxford", af.audioFromOxford],
		// ["audioFromGoogleDefine", af.audioFromGoogleDefine],
		// ["audioFromGoogleSpeech", af.audioFromGoogleSpeech],
		// ["audioFromResponsiveVoice", af.audioFromResponsiveVoice],
	]) {
		console.log(name);
		/**
		 * @type {HTMLAudioElement}
		 */
		const audio = await fn(word);
		console.log(audio);
		await audio.play();
		console.log("\n".repeat(3));
	}
})().catch(console.error);

console.log("audioFrom test end");
