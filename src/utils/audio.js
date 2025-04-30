/**
 * @param {HTMLAudioElement} audio
 * @returns {HTMLAudioElement}
 */
export function addLoudnessLimiter(audio) {
	const clone = audio.cloneNode(true);
	const context = new AudioContext();
	const source = context.createMediaElementSource(clone);
	const compressor = context.createDynamicsCompressor();
	const gainNode = context.createGain();
	const analyser = context.createAnalyser();
	compressor.threshold.setValueAtTime(-24, context.currentTime);
	compressor.knee.setValueAtTime(30, context.currentTime);
	compressor.ratio.setValueAtTime(12, context.currentTime);
	compressor.attack.setValueAtTime(0.003, context.currentTime);
	compressor.release.setValueAtTime(0.25, context.currentTime);
	source.connect(compressor);
	compressor.connect(gainNode);
	gainNode.connect(context.destination);
	gainNode.connect(analyser);
	return clone;
}
