import { blob2base64 } from "./element.js";
import { optionsTable } from "./storage-tables.js";
import { showPopup } from "./show-popup.js";

const host = document.createElement("span");
host.dataset.role = "pronunciation-addon-audio-player-host";
host.style.display = "inline";
host.style.width = "0px";
host.style.height = "0px";
host.style.border = "0px";
host.style.margin = "0px";
host.style.padding = "0px";
const shadow = host.attachShadow({
	mode: "closed",
	clonable: false,
});
const audio = new Audio();
audio.autoplay = false;
shadow.replaceChildren(...createAudioPlayerUI());
shadow.appendChild(audio);
document.body.appendChild(host);

document.addEventListener("securitypolicyviolation", (e) => {
	if (host.contains(e.target)) {
		console.log({ pronAddonSecuritypolicyviolation: e });
		host.remove();
	}
});

/**
 * @param {string} id
 * @returns {HTMLElement | null}
 */
const byId = (id) => shadow.getElementById(id);

/**
 * @type {PlayerAudioSource[]}
 */
let sources = [];

const el = {
	audio,
	sources,
	player: byId("audio-player"),
	progressbar: byId("audio-player-progresssbar"),
	currentTime: byId("audio-player-current-time"),
	totalTime: byId("audio-player-total-time"),
	togglePlayButton: byId("audio-player-toggle-play"),
	playIcon: byId("audio-player-icon-play"),
	pauseIcon: byId("audio-player-icon-pause"),
	rewind: byId("audio-player-rewind"),
	backward: byId("audio-player-backward"),
	forward: byId("audio-player-forward"),
	previous: byId("audio-player-previous"),
	next: byId("audio-player-next"),
	volumeControl: byId("audio-player-volume-control"),
	toggleMuteButton: byId("audio-player-toggle-mute"),
	unmutedIcon: byId("audio-player-icon-unmuted"),
	mutedIcon: byId("audio-player-icon-muted"),
	mainTitle: byId("audio-player-main-title"),
	showSpeedsButton: byId("audio-player-show-speeds"),
	speedsList: byId("audio-player-speeds"),
	download: byId("audio-player-download"),
	linkDownload: byId("audio-player-link-download"),
	upload: byId("audio-player-upload"),
	inputUpload: byId("audio-player-input-upload"),
	close: byId("audio-player-close"),
};

const opt = {
	playerEnabled: true,
	shortcutsEnabled: true,
	skipSeconds: 3,
	shortcuts: {},
	action2shortcut: {},
	shortcut2action: {},
};

const action2function = {
	togglePlayer: async () => toggleAudioPlayer(),
	togglePlay: async () => togglePlayAudio(),
	toggleMute: async () => toggleMuteAudio(),
	previous: async () => previousAudio(),
	next: async () => nextAudio(),
	rewind: async () => rewindAudio(),
	backward: async () => backwardAudio(opt.skipSeconds),
	forward: async () => forwardAudio(opt.skipSeconds),
	decreaseVolume: async () => changeAudioVolume(audio.volume - 0.05),
	increaseVolume: async () => changeAudioVolume(audio.volume + 0.05),
	decreaseSpeed: async () => changeAudioSpeed(audio.playbackRate - 0.1),
	increaseSpeed: async () => changeAudioSpeed(audio.playbackRate + 0.1),
	resetSpeed: async () => changeAudioSpeed(1),
};

(async () => {
	/**
	 * @type {OptionsAudio}
	 */
	const audioOpt = await optionsTable.getValue("audio");
	opt.playerEnabled = audioOpt.text.playerEnabled;
	opt.shortcutsEnabled = audioOpt.text.shortcutsEnabled;
	opt.skipSeconds = audioOpt.text.skipSeconds;
	setAudioControlShortcuts(audioOpt.text.shortcuts);
})().catch(console.error);

el.currentTime.textContent = formatSeconds(0);
el.totalTime.textContent = formatSeconds(0);

audio.addEventListener("canplay", async () => {
	await togglePlayAudio({
		forcePlay: !audio.paused,
		forcePause: audio.paused,
	});
	toggleMuteAudio({
		forceMute: audio.muted,
		forceUnmute: !audio.muted,
	});
	const duration = await audioDuration(audio);
	el.progressbar.max = duration;
	el.totalTime.textContent = formatSeconds(duration);
	changeAudioVolume(audio.volume);
	changeAudioSpeed(audio.playbackRate);
});

audio.addEventListener("ended", async () => {
	await togglePlayAudio({ forcePause: true });
	el.progressbar.value = audio.dataset.validDuration;
	el.totalTime.textContent = formatSeconds(audio.dataset.validDuration);
	el.progressbar.style.background = "var(--range-color)";
});

el.progressbar.addEventListener("input", () => {
	audio.currentTime = parseFloat(el.progressbar.value);
});

el.volumeControl.addEventListener("input", () => {
	audio.volume = parseFloat(el.volumeControl.value);
});

audio.addEventListener("timeupdate", async () => {
	el.totalTime.textContent = formatSeconds(audio.dataset.validDuration);
	el.progressbar.max = await audioDuration(audio);
	el.currentTime.textContent = formatSeconds(audio.currentTime);
	el.progressbar.value = audio.currentTime;
	el.progressbar.style.background = "var(--range-background)";
});

el.togglePlayButton.addEventListener("click", async () => togglePlayAudio());
el.toggleMuteButton.addEventListener("click", () => toggleMuteAudio());
el.rewind.addEventListener("click", () => rewindAudio());
el.backward.addEventListener("click", () => {
	backwardAudio(opt.skipSeconds);
});
el.forward.addEventListener("click", async () => {
	forwardAudio(opt.skipSeconds);
});
el.previous.addEventListener("click", async () => previousAudio());
el.next.addEventListener("click", async () => nextAudio());

el.showSpeedsButton.addEventListener("click", () => {
	el.speedsList.classList.toggle("invisible");
});

el.speedsList.addEventListener("click", ({ target }) => {
	const speed = target.dataset.speed;
	if (speed) {
		changeAudioSpeed(parseFloat(speed));
	}
});

el.download.addEventListener("click", () => {
	if (!audio.src) {
		showInfo("There is no current audio");
		return;
	}
	el.linkDownload.href = audio.src;
	el.linkDownload.download = audio.dataset.currentId;
	el.linkDownload.click();
	el.linkDownload.href = "";
	el.linkDownload.download = "";
});

el.upload.addEventListener("click", () => {
	el.inputUpload.click();
});

el.inputUpload.addEventListener("change", async () => {
	const file = el.inputUpload.files?.[0];
	if (!file) {
		showInfo("No file was found in input");
		return;
	}
	try {
		const base64 = await blob2base64(file);
		const testAudio = new Audio(base64);
		testAudio.volume = 0;
		await testAudio.play();
		testAudio.pause();
		/**
		 * @type {PlayerAudioSource}
		 */
		const source = {
			id: file.name,
			title: file.name,
			url: testAudio.src,
		};
		await addAudioSource(source, { play: true });
	} catch (error) {
		showInfo(`Error with the file: ${error}`);
		console.error(error);
	}
});

document.addEventListener("keydown", async (e) => {
	if (!opt.shortcutsEnabled || sources.length === 0) {
		return;
	}
	const key = e.key.toUpperCase();
	if (
		!(key in opt.shortcut2action) ||
		[e.altKey, e.ctrlKey, e.metaKey].some(v => v)
	) {
		return;
	}
	e.preventDefault();
	const action = opt.shortcut2action[key];
	try {
		await action2function[action]();
	} catch (error) {
		console.error(error);
	}
});

el.close.addEventListener("click", async () => {
	return toggleAudioPlayer({ forceDisable: true, forcePause: true });
});

/**
 * @param {{
 *     forceEnable: boolean,
 *     forceDisable: boolean,
 *     forcePause: boolean,
 *     player: HTMLElement,
 *     audio: HTMLAudioElement,
 *     togglePlayButton: HTMLElement,
 *     playIcon: HTMLElement,
 *     pauseIcon: HTMLElement,
 * }}
 * @returns {Promise<void>}
 */
export async function toggleAudioPlayer({
	forceEnable=false,
	forceDisable=false,
	forcePause=false,
	player=el.player,
	audio=el.audio,
	togglePlayButton=el.togglePlayButton,
	playIcon=el.playIcon,
	pauseIcon=el.pauseIcon,
}={}) {
	const enable = (
		!forceEnable && !forceDisable ?
		!opt.playerEnabled :
		forceEnable
	);
	if (enable) {
		player.classList.remove("invisible");
	} else {
		if (forcePause) {
			await togglePlayAudio({
				audio,
				togglePlayButton,
				playIcon,
				pauseIcon,
				forcePause,
			});
		}
		player.classList.add("invisible");
	}
	opt.playerEnabled = enable;
}

/**
 * @param {{
 *     forceEnable: boolean,
 *     forceDisable: boolean,
 * }}
 * @returns {void}
 */
export function toggleAudioControlShortcuts({
	forceEnable=false,
	forceDisable=false,
}={}) {
	opt.shortcutsEnabled = (
		!forceEnable && !forceDisable ?
		!opt.shortcutsEnabled :
		forceEnable
	);
}

/**
 * @param {number} seconds
 * @returns {void}
 */
export function changeSkipSeconds(seconds) {
	opt.skipSeconds = seconds;
}

/**
 * @param {PlayerAudioSource} source
 * @param {{
 *     audio: HTMLAudioElement,
 *     mainTitle: HTMLElement,
 *     sources: PlayerAudioSource[],
 *     togglePlayButton: HTMLElement,
 *     playIcon: HTMLElement,
 *     pauseIcon: HTMLElement,
 *     play: boolean,
 * }}
 * @returns {Promise<PlayerAudioSource[]>}
 */
export async function addAudioSource(source, {
	audio=el.audio,
	mainTitle=el.mainTitle,
	sources=el.sources,
	togglePlayButton=el.togglePlayButton,
	playIcon=el.playIcon,
	pauseIcon=el.pauseIcon,
	play=false,
}={}) {
	let index = sources.findIndex(s => s.id === source.id);
	if (index === -1) {
		index = sources.push(source) - 1;
	}
	const currentIndex = parseInt(audio.dataset.currentSource ?? "-1");
	if (play || currentIndex === -1) {
		await changeAudioSource(index, { audio, mainTitle, sources });
	}
	if (play) {
		await togglePlayAudio({
			audio,
			togglePlayButton,
			playIcon,
			pauseIcon,
			forcePlay: true,
		});
	}
	return sources;
}

/**
 * @param {string} id
 * @param {{
 *     audio: HTMLAudioElement,
 *     mainTitle: HTMLElement,
 *     sources: PlayerAudioSource[],
 *     togglePlayButton: HTMLElement,
 *     playIcon: HTMLElement,
 *     pauseIcon: HTMLElement,
 *     currentTime: HTMLElement,
 *     totalTime: HTMLElement,
 *     progressbar: HTMLInputElement,
 * }}
 * @returns {Promise<PlayerAudioSource[]>}
 */
export async function removeAudioSource(id, {
	audio=el.audio,
	mainTitle=el.mainTitle,
	sources=el.sources,
	togglePlayButton=el.togglePlayButton,
	playIcon=el.playIcon,
	pauseIcon=el.pauseIcon,
	currentTime=el.currentTime,
	totalTime=el.totalTime,
	progressbar=el.progressbar,
}={}) {
	const index = sources.findIndex(s => s.id === id);
	if (index === -1) {
		return console.warn(`Id ${id} is not in audio sources`);
	}
	sources.splice(index, 1);
	const currentIndex = parseInt(audio.dataset.currentSource ?? "-1");
	if (currentIndex === index) {
		await togglePlayAudio({
			audio,
			togglePlayButton,
			playIcon,
			pauseIcon,
			forcePause: true,
		});
		audio.currentTime = 0;
		audio.src = "";
		audio.load();
		if (sources.length > 0) {
			await changeAudioSource(0, { audio, mainTitle, sources });
		} else {
			mainTitle.textContent = "";
			currentTime.textContent = formatSeconds(0);
			totalTime.textContent = formatSeconds(0);
			progressbar.min = 0;
			progressbar.max = 0;
			progressbar.value = 0;
		}
	}
	return sources;
}

/**
 * @param {OptAudioShortcuts} shortcuts
 * @returns {void}
 */
export function setAudioControlShortcuts(shortcuts={}) {
	opt.action2shortcut = Object
		.entries(shortcuts)
		.reduce((obj, [key, value]) => {
			obj[key] = value.trim().toUpperCase();
			return obj;
		}, {});
	opt.shortcut2action = Object
		.entries(opt.action2shortcut)
		.reduce((obj, [key, value]) => {
			obj[value] = key;
			return obj;
		}, {});
}

/**
 * @param {{
 *     audio: HTMLAudioElement,
 *     togglePlayButton: HTMLElement,
 *     playIcon: HTMLElement,
 *     pauseIcon: HTMLElement,
 *     forcePlay: boolean,
 *     forcePause: boolean,
 * }}
 * @returns {Promise<void>}
 */
async function togglePlayAudio({
	audio=el.audio,
	togglePlayButton=el.togglePlayButton,
	playIcon=el.playIcon,
	pauseIcon=el.pauseIcon,
	forcePlay=false,
	forcePause=false,
}={}) {
	const pause = !forcePlay && !forcePause ? !audio.paused : forcePause;
	if (pause) {
		audio.pause();
		togglePlayButton.title = "Play";
	} else {
		await audio.play();
		togglePlayButton.title = "Pause";
	}
	playIcon.classList.toggle("invisible", !pause);
	pauseIcon.classList.toggle("invisible", pause);
}

/**
 * @param {{
 *     audio: HTMLAudioElement,
 *     toggleMuteButton: HTMLElement,
 *     mutedIcon: HTMLElement,
 *     unmutedIcon: HTMLElement,
 *     unmutedIcon: HTMLElement,
 *     forceMute: boolean,
 *     forceUnmute: boolean,
 * }}
 * @returns {void}
 */
function toggleMuteAudio({
	audio=el.audio,
	toggleMuteButton=el.toggleMuteButton,
	mutedIcon=el.mutedIcon,
	unmutedIcon=el.unmutedIcon,
	forceMute=false,
	forceUnmute=false,
}={}) {
	const mute = !forceMute && !forceUnmute ? !audio.muted : forceMute;
	if (mute) {
		toggleMuteButton.title = "Unmute";
	} else {
		toggleMuteButton.title = "Mute";
	}
	audio.muted = mute;
	mutedIcon.classList.toggle("invisible", !mute);
	unmutedIcon.classList.toggle("invisible", mute);
}

/**
 * @param {{
 *     audio: HTMLAudioElement,
 * }}
 * @returns {Promise<void>}
 */
async function rewindAudio({
	audio=el.audio,
}={}) {
	audio.currentTime = 0;
	await audio.play();
}

/**
 * @param {number} seconds
 * @param {{
 *     audio: HTMLAudioElement,
 * }}
 * @returns {void}
 */
async function forwardAudio(seconds, {
	audio=el.audio,
}={}) {
	audio.currentTime = Math.min(
		audio.currentTime + seconds,
		await audioDuration(audio),
	);
}

/**
 * @param {number} seconds
 * @param {{
 *     audio: HTMLAudioElement,
 * }}
 * @returns {void}
 */
function backwardAudio(seconds, {
	audio=el.audio,
}={}) {
	audio.currentTime = Math.max(
		audio.currentTime - seconds,
		0,
	);
}

/**
 * @param {number} sourceIndex
 * @param {{
 *     audio: HTMLAudioElement,
 *     mainTitle: HTMLElement,
 *     sources: PlayerAudioSource[],
 * }}
 * @returns {Promise<void>}
 */
async function changeAudioSource(sourceIndex, {
	audio=el.audio,
	mainTitle=el.mainTitle,
	sources=el.sources,
}={}) {
	const paused = audio.paused;
	const s = sources[sourceIndex];
	audio.dataset.validDuration = -1;
	audio.dataset.currentId = s.id;
	audio.dataset.currentSource = sourceIndex;
	audio.src = s.url;
	audio.load();
	if (!paused) {
		await audio.play();
	}
	mainTitle.textContent = s.title;
}

/**
 * @param {{
 *    audio: HTMLAudioElement,
 *    mainTitle: HTMLElement,
 *    sources: PlayerAudioSource[],
 * }}
 * @returns {Promise<void>}
 */
async function previousAudio({
	audio=el.audio,
	mainTitle=el.mainTitle,
	sources=el.sources,
}={}) {
	if (sources.length === 0) {
		return console.warn("There is no audio source");
	}
	const index = parseInt(audio.dataset.currentSource);
	const newIndex = index - 1;
	if (newIndex > -1) {
		await changeAudioSource(newIndex, { audio, mainTitle, sources });
	} else {
		audio.currentTime = 0;
	}
}

/**
 * @param {{
 *    audio: HTMLAudioElement,
 *    mainTitle: HTMLElement,
 *    sources: PlayerAudioSource[],
 * }}
 * @returns {Promise<void>}
 */
async function nextAudio({
	audio=el.audio,
	mainTitle=el.mainTitle,
	sources=el.sources,
}={}) {
	if (sources.length === 0) {
		return console.warn("There is no audio source");
	}
	const index = parseInt(audio.dataset.currentSource);
	const newIndex = index + 1;
	if (newIndex < sources.length) {
		await changeAudioSource(newIndex, { audio, mainTitle, sources });
	} else {
		audio.currentTime = await audioDuration(audio);
	}
}

/**
 * @param {number} volume
 * @param {{
 *     audio: HTMLAudioElement,
 *     volumeControl: HTMLInputElement,
 * }}
 * @returns {Promise<void>}
 */
function changeAudioVolume(volume, {
	audio=el.audio,
	volumeControl=el.volumeControl,
}={}) {
	const value = Math.max(0, Math.min(volume, 1));
	volumeControl.value = value;
	audio.volume = value;
}

/**
 * @param {number} speed
 * @param {{
 *    audio: HTMLAudioElement,
 *    showSpeedButton: HTMLElement,
 *    speedsList: HTMLElement,
 * }}
 * @returns {Promise<void>}
 */
function changeAudioSpeed(speed, {
	audio=el.audio,
	showSpeedsButton=el.showSpeedsButton,
	speedsList=el.speedsList,
}={}) {
	const rounded = Math.max(
		0.2,
		Math.min(
			Math.round(speed * 10) / 10,
			2.0,
		),
	);
	const datasetValue = rounded.toFixed(1);
	const classSelected = "audio-player-speed-option-current";
	speedsList.querySelector(
		`.${classSelected}`,
	).classList.remove(classSelected);
	speedsList.querySelector(
		`[data-speed="${datasetValue}"]`,
	).classList.add(classSelected);
	showSpeedsButton.textContent = `${rounded}x`;
	audio.playbackRate = rounded;
}

/**
 * @param {HTMLAudioElement} audio
 * @returns {Promise<number>}
 */
async function audioDuration(audio) {
	if (audio.dataset.validDuration < 0) {
		if (validAudioDuration(audio)) {
			audio.dataset.validDuration = audio.duration;
		} else {
			console.log({ pronAddon: "audio duration from AudioContext" });
			const response = await fetch(audio.src);
			if (response.status !== 200) {
				throw new Error(`Status: ${response.status}`);
			}
			const arrayBuffer = await response.arrayBuffer();
			const audioContext = new AudioContext();
			const decoded = await audioContext.decodeAudioData(arrayBuffer);
			audio.dataset.validDuration = decoded.duration;
		}
	}
	return audio.dataset.validDuration;
}

/**
 * @param {HTMLAudioElement} audio
 * @returns {boolean}
 */
function validAudioDuration(audio) {
	return Number.isFinite(audio.duration) && audio.duration !== 0;
}

/**
 * @param {number} seconds
 * @returns {string}
 */
function formatSeconds(seconds) {
	const [hours, modHours] = divAndMod(seconds, 3600);
	const [minutes, sec] = divAndMod(modHours, 60);
	let formatted = [
		padTime(minutes),
		padTime(Math.floor(sec)),
	].join(":");
	if (hours > 0) {
		formatted = `${padTime(hours)}:${formatted}`;
	}
	return formatted;
}

/**
 * @param {number} time
 * @returns {string}
 */
function padTime(time) {
	return time.toString().padStart(2, "0");
}

/**
 * @param {number} a
 * @param {number} b
 * @returns {[number, number]}
 */
function divAndMod(a, b) {
	return [
		Math.floor(a / b),
		a % b,
	];
}

/**
 * @param {string} info
 * @param {closeTimeout} number
 * @returns {void}
 */
export function showInfo(info, closeTimeout=3000) {
	showPopup({
		text: info,
		position: {
			centerHorizontally: true,
			top: 200,
		},
		close: {
			timeout: closeTimeout,
		},
	});
}

/**
 * @returns {HTMLElement[]}
 */
function createAudioPlayerUI() {
const html = `

<!-- Code injected by How2Say addon -->

<style>

:host {
	--background-color-1: #101010;
	--foreground-color-1: #b3b3b3;
	--foreground-color-2: #e4e4e4;
	--center-width: 40%;
	--side-width: 25%;
}

h1,
div,
span,
ul,
li,
input,
button {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
	border: 0;
	list-style-type: none;
	font-family: Verdana, sans-serif;
}

.audio-player {
	position: fixed;
	left: 0;
	bottom: 0;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	gap: 4px;
	width: 100%;
	height: 72px;
	padding: 0 20px;
	background-color: var(--background-color-1);
	z-index: 99999;
}

.audio-player-close {
	position: absolute;
	top: 4px;
	left: 4px;
	display: inline-block;
	background-color: inherit;
	border: none;
	font: 20px/1.0 'Arial', sans-serif;
	font-style: normal;
	color: var(--foreground-color-1);
	text-align: center;
	text-decoration: none;
	white-space: nowrap;
	cursor: pointer;
	overflow: hidden;
}

.audio-player-close:hover {
	transform: scale(1.1);
	color: var(--foreground-color-2);
}

.audio-player-center {
	display: flex;
	flex-direction: column;
	gap: 8px;
	align-items: center;
	width: var(--center-width);
}

.audio-player-controls {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	gap: 25px;
}

.audio-player-speed {
	position: relative;
	width: 30px;
}

.audio-player-speed button {
	color: var(--foreground-color-1);
	font-size: 15px;
}

.audio-player-speed button:hover {
	color: var(--foreground-color-2);
}

.audio-player-speeds {
	position: absolute;
	bottom: calc(100% + 10px);
	left: 0;
	width: 160px;
	height: 480px;
	color: var(--foreground-color-2);
	overflow-y: auto;
	opacity: 1;
	transition: 0.2s linear;
}

.audio-player-speed-option,
.audio-player-speed-title {
	padding: 10px 5px;
	background-color: #282828;
}

.audio-player-speed-title {
	position: sticky;
	left: 0;
	top: 0;
	font-size: 11px;
}

.audio-player-speed-option {
	font-size: 14px;
}

.audio-player-speed-option:hover {
	background-color: rgb(62, 62, 62);
	cursor: pointer;
}

.audio-player-speed-option-current {
	color: rgb(86, 155, 179);
	font-weight: bold;
}

.audio-player-time {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	gap: 6px;
	width: 100%;
	color: var(--foreground-color-1);
	font-size: 12px;
}

.audio-player-btn {
	background-color: transparent;
	height: 16px;
	width: 16px;
	cursor: pointer;
}

.audio-player-btn svg {
	fill: var(--foreground-color-1);
}

.audio-player-btn:hover {
	transform: scale(1.1);
}

.audio-player-btn:hover svg {
	fill: var(--foreground-color-2);
}

.audio-player-btn-toggle-play {
	--foreground-color-1: var(--background-color-1);
	--foreground-color-2: var(--background-color-1);
	height: 32px;
	width: 32px;
	background-color: #ffffff;
	border-radius: 50%;
	display: inline-block;
	padding: 7px;
}

.audio-player-title {
	font-family: Arial, Helvetica, sans-serif;
	font-size: 14px;
	font-weight: normal;
	color: var(--foreground-color-2);
	width: var(--side-width);
}

.audio-player-main-title {
	font-family: Arial, Helvetica, sans-serif;
	font-size: 14px;
	font-weight: normal;
}

.audio-player-volume {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-end;
	gap: 6px;
	width: var(--side-width);
}

.audio-player-volume input[type="range"] {
	max-width: 140px;
}

.input-range {
	--range-height: 6px;
	--range-background: #616161;
	--range-color: var(--foreground-color-2);
	--range-color-shadow-color-1: rgba(46, 138, 168, 0.1);
	--range-color-shadow-color-2: rgba(46, 138, 168, 0.2);
	--range-color-shadow-size-1: 9px;
	--range-color-shadow-size-2: 12px;
	--range-pointer-size: 0px;
	appearance: none;
	width: 100%;
	cursor: pointer;
	outline: none;
	border-radius: 15px;
	height: 5px;
	background: var(--range-background);
	transition: .1s linear;
}

.input-range:hover {
	--range-color: rgb(159, 212, 230);
	--range-pointer-size: 12px;
}

.input-range::-moz-range-progress {
	background-color: var(--range-color);
}

.input-range::-moz-range-thumb {
	appearance: none;
	height: var(--range-pointer-size);
	width: var(--range-pointer-size);
	background-color: var(--range-color);
	border-radius: 50%;
	border: none;
	transition: .1s linear;
}

.invisible {
	display: none;
	opacity: 0;
}

@media screen and (max-width: 600px) {

	:host {
		--center-width: 100%;
		--side-width: 100%;
	}

	.audio-player {
		flex-direction: column;
		padding: 20px 10px;
		height: 140px;
	}

	.audio-player-center {
		order: 0;
	}

	.audio-player-volume {
		order: 1;
	}

	.audio-player-controls {
		width: 100%;
		justify-content: space-evenly;
	}

	.audio-player-volume input[type="range"] {
		max-width: calc(100% - 20px);
		width: calc(100% - 20px);
	}

	.audio-player-title {
		order: 2;
		text-align: center;
		text-overflow: ellipsis;
	}

	@media only screen and (hover: none) and (pointer: coarse) {
		.audio-player-volume {
			display: none;
		}
	}

}

</style>

    <div id="audio-player" class="audio-player invisible">
        <span id="audio-player-close" class="audio-player-close">
            &#215;
        </span>
        <div class="audio-player-title">
            <h1 id="audio-player-main-title" class="audio-player-main-title"></h1>
        </div>
        <div class="audio-player-center">
            <div class="audio-player-controls">
                <button id="audio-player-download" class="audio-player-btn" title="Download audio">
                    <svg width="16" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 29.978 29.978" xml:space="preserve">
                        <g>
                            <path
                                d="M25.462,19.105v6.848H4.515v-6.848H0.489v8.861c0,1.111,0.9,2.012,2.016,2.012h24.967c1.115,0,2.016-0.9,2.016-2.012 v-8.861H25.462z" />
                            <path
                                d="M14.62,18.426l-5.764-6.965c0,0-0.877-0.828,0.074-0.828s3.248,0,3.248,0s0-0.557,0-1.416c0-2.449,0-6.906,0-8.723 c0,0-0.129-0.494,0.615-0.494c0.75,0,4.035,0,4.572,0c0.536,0,0.524,0.416,0.524,0.416c0,1.762,0,6.373,0,8.742 c0,0.768,0,1.266,0,1.266s1.842,0,2.998,0c1.154,0,0.285,0.867,0.285,0.867s-4.904,6.51-5.588,7.193 C15.092,18.979,14.62,18.426,14.62,18.426z" />
                        </g>
                    </svg>
                </button>
                <a id="audio-player-link-download" class="invisible"></a>
                <button id="audio-player-rewind" class="audio-player-btn" title="Rewind audio">
                    <svg width="16" version="1.1" xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 20.465 20.465"
                        xml:space="preserve">
                        <path d="M11.354,1.373c-0.141-0.069-0.304-0.049-0.425,0.044L0.152,9.918C0.059,9.996,0,10.11,0,10.231
                                s0.059,0.24,0.152,0.316l10.776,8.5c0.073,0.057,0.163,0.086,0.249,0.086l0.176-0.04c0.138-0.064,0.225-0.205,0.225-0.36v-17
                                C11.578,1.582,11.491,1.438,11.354,1.373z"></path>
                        <path d="M20.242,1.373c-0.142-0.069-0.305-0.049-0.426,0.044L9.039,9.918
                                c-0.094,0.078-0.152,0.192-0.152,0.313s0.059,0.24,0.152,0.316l10.777,8.5c0.072,0.057,0.162,0.086,0.248,0.086l0.178-0.04
                                c0.137-0.064,0.223-0.205,0.223-0.36v-17C20.465,1.582,20.379,1.438,20.242,1.373z">
                        </path>
                    </svg>
                </button>
                <button id="audio-player-backward" class="audio-player-btn" title="Skip back 2 seconds">
                    <svg viewBox="0 0 16 16">
                        <path
                            d="M2.464 4.5h1.473a.75.75 0 0 1 0 1.5H0V2.063a.75.75 0 0 1 1.5 0v1.27a8.25 8.25 0 1 1 10.539 12.554.75.75 0 0 1-.828-1.25A6.75 6.75 0 1 0 2.464 4.5Z">
                        </path>
                    </svg>
                </button>
                <button id="audio-player-previous" class="audio-player-btn" title="Previous">
                    <svg viewBox="0 0 16 16">
                        <path
                            d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z">
                        </path>
                    </svg>
                </button>
                <button id="audio-player-toggle-play" class="audio-player-btn audio-player-btn-toggle-play"
                    title="Play/Pause">
                    <svg viewBox="0 0 16 16">
                        <path id="audio-player-icon-play"
                            d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.288V1.713z">
                        </path>
                        <path id="audio-player-icon-pause" class="invisible"
                            d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z">
                        </path>
                    </svg>
                </button>
                <button id="audio-player-next" class="audio-player-btn" title="Next">
                    <svg viewBox="0 0 16 16">
                        <path
                            d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z">
                        </path>
                    </svg>
                </button>
                <button id="audio-player-forward" class="audio-player-btn" title="Skip forward 2 seconds">
                    <svg viewBox="0 0 16 16">
                        <path
                            d="M13.536 4.488h-1.473a.75.75 0 1 0 0 1.5H16V2.051a.75.75 0 0 0-1.5 0v1.27A8.25 8.25 0 1 0 3.962 15.876a.75.75 0 0 0 .826-1.252 6.75 6.75 0 1 1 8.747-10.136Z">
                        </path>
                    </svg>
                </button>
                <div class="audio-player-speed">
                    <button id="audio-player-show-speeds" class="audio-player-btn">1x</button>
                    <ul id="audio-player-speeds" class="audio-player-speeds invisible">
                        <li class="audio-player-speed-title">Plackback speed</li>
                        <li data-speed="0.2" class="audio-player-speed-option">0.2x</li>
                        <li data-speed="0.3" class="audio-player-speed-option">0.3x</li>
                        <li data-speed="0.4" class="audio-player-speed-option">0.4x</li>
                        <li data-speed="0.5" class="audio-player-speed-option">0.5x</li>
                        <li data-speed="0.6" class="audio-player-speed-option">0.6x</li>
                        <li data-speed="0.7" class="audio-player-speed-option">0.7x</li>
                        <li data-speed="0.8" class="audio-player-speed-option">0.8x</li>
                        <li data-speed="0.9" class="audio-player-speed-option">0.9x</li>
                        <li data-speed="1.0" class="audio-player-speed-option audio-player-speed-option-current">
                            1x</li>
                        <li data-speed="1.1" class="audio-player-speed-option">1.1x</li>
                        <li data-speed="1.2" class="audio-player-speed-option">1.2x</li>
                        <li data-speed="1.3" class="audio-player-speed-option">1.3x</li>
                        <li data-speed="1.4" class="audio-player-speed-option">1.4x</li>
                        <li data-speed="1.5" class="audio-player-speed-option">1.5x</li>
                        <li data-speed="1.6" class="audio-player-speed-option">1.6x</li>
                        <li data-speed="1.7" class="audio-player-speed-option">1.7x</li>
                        <li data-speed="1.8" class="audio-player-speed-option">1.8x</li>
                        <li data-speed="1.9" class="audio-player-speed-option">1.9x</li>
                        <li data-speed="2.0" class="audio-player-speed-option">2x</li>
                    </ul>
                </div>
                <button id="audio-player-upload" class="audio-player-btn" title="Upload audio">
                    <svg width="16" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 374.116 374.116" xml:space="preserve">
                        <g>
                            <path
                                d="M344.058,207.506c-16.568,0-30,13.432-30,30v76.609h-254v-76.609c0-16.568-13.432-30-30-30c-16.568,0-30,13.432-30,30 v106.609c0,16.568,13.432,30,30,30h314c16.568,0,30-13.432,30-30V237.506C374.058,220.938,360.626,207.506,344.058,207.506z" />
                            <path
                                d="M123.57,135.915l33.488-33.488v111.775c0,16.568,13.432,30,30,30c16.568,0,30-13.432,30-30V102.426l33.488,33.488 c5.857,5.858,13.535,8.787,21.213,8.787c7.678,0,15.355-2.929,21.213-8.787c11.716-11.716,11.716-30.71,0-42.426L208.271,8.788 c-11.715-11.717-30.711-11.717-42.426,0L81.144,93.489c-11.716,11.716-11.716,30.71,0,42.426 C92.859,147.631,111.855,147.631,123.57,135.915z" />
                        </g>
                    </svg>
                </button>
                <input id="audio-player-input-upload" class="invisible" type="file" accept="audio/*">
            </div>
            <div class="audio-player-time">
                <span id="audio-player-current-time">0:00</span>
                <input id="audio-player-progresssbar" class="input-range" type="range" min="0" max="100" step="0.01"
                    value="30">
                <span id="audio-player-total-time">0:00</span>
            </div>
        </div>
        <div class="audio-player-volume">
            <button id="audio-player-toggle-mute" class="audio-player-btn" title="Mute/Unmute">
                <svg id="audio-player-icon-unmuted" viewBox="0 0 16 16">
                    <path
                        d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.642 3.642 0 0 1-1.33-4.967 3.639 3.639 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.139 2.139 0 0 0 0 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88z">
                    </path>
                    <path d="M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127v1.55z">
                    </path>
                </svg>
                <svg id="audio-player-icon-muted" class="invisible" viewBox="0 0 16 16">
                    <path
                        d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06z">
                    </path>
                    <path
                        d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.642 3.642 0 0 0-1.33 4.967 3.639 3.639 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.73 4.73 0 0 1-1.5-.694v1.3L2.817 9.852a2.141 2.141 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694V1.5z">
                    </path>
                </svg>
            </button>
            <input id="audio-player-volume-control" class="input-range" type="range" min="0" max="1" step="0.01"
                value="0.3">
        </div>
    </div>

`;
	const template = document.createElement("template");
	template.innerHTML = html;
	return Array.from(template.content.children);
}
