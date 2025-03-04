(function () {
	'use strict';

	const digitPattern = /\d+/g;

	/**
	 * @param {string} text
	 * @returns {string}
	 */
	function filterDigits(text) {
		return text.match(digitPattern).join("");
	}

	/**
	 * @param {string} rgba
	 * @returns {string}
	 */
	function rgba2rgb(rgba) {
		if (rgba.startsWith("rgba")) {
			return rgba
				.replace("a", "")
				.slice(0, rgba.lastIndexOf(",") -1)
				.concat(")");
		} else {
			return rgba;
		}
	}

	const template = createTemplate();
	document.body.appendChild(template);

	/**
	 * @type {OptionsPopup}
	 */
	const defaultOptionsPopup = {
		text: "Default text",
		font: {
			family: "Arial, serif",
			size: 20,
			color: "#282828",
			backgroundColor: "#FFFFFF",
		},
		close: {
			timeout: 3000,
			shortcut: "\\",
			onScroll: false,
			buttonColor: "#737373",
			buttonHoverColor: "#010101",
		},
		position: {
			top: 100,
			left: 250,
		},
	};

	/**
	 * @param {OptionsPopup} options
	 * @returns {void}
	 */
	function showPopup(options) {

		/**
		 * @type {OptionsPopup}
		 */
		const opt = { ...defaultOptionsPopup, ...options };
		const host = document.createElement("span");
		host.dataset.role = "pronunciation-addon-popup-host";
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
		shadow.appendChild(template.content.cloneNode(true));

		/**
		 * @param {string} role
		 * @returns {HTMLElement | null}
		 */
		const byRole = (role) => shadow.querySelector(`[data-role="${role}"]`);

		byRole("text").textContent = opt.text;
		console.log({ pronuciationPopupText: opt.text });

		const popup = byRole("popup");
		const close = byRole("close");

		/**
		 * @param {string} prop
		 * @param {string} val
		 * @returns {void}
		 */
		const setProperty = (prop, val) => popup.style.setProperty(prop, val);

		setProperty("--top", `${opt.position.top}px`);
		setProperty("--left", `${opt.position.left}px`);
		setProperty("--background-color", opt.font.backgroundColor);
		setProperty("--font-family", opt.font.family);
		setProperty("--font-size", `${opt.font.size}px`);
		setProperty("--font-color", opt.font.color);
		setProperty("--close-button-color", opt.close.buttonColor);
		setProperty("--close-button-color-hover", opt.close.buttonHoverColor);

		popup.style.visibility = "hidden";
		document.body.appendChild(host);
		const rect = popup.getBoundingClientRect();
		const rightMargin = window.innerWidth - rect.right;
		if (rightMargin <= 0) {
			popup.style.right = "5px";
		}
		popup.style.visibility = "visible";

		const timeoutId = setTimeout(closePopup, opt.close.timeout);
		popup.addEventListener("mousedown", disableTimeout);
		close.addEventListener("click", closePopup);
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("scroll", onScroll);

		function onScroll() {
			if (opt.close.onScroll) {
				closePopup();
			}
		}

		/**
		 * @param {KeyboardEvent} event
		 * @returns {void}
		 */
		function onKeyDown(event) {
			if (event.key.toUpperCase() === opt.close.shortcut) {
				event.preventDefault();
				closePopup();
			}
		}

		function disableTimeout() {
			clearTimeout(timeoutId);
			popup.removeEventListener("mousedown", disableTimeout);
			document.removeEventListener("scroll", onScroll);
		}

		function closePopup() {
			disableTimeout();
			close.removeEventListener("click", closePopup);
			document.removeEventListener("keydown", onKeyDown);
			host.remove();
		}

	}
	/**
	 * @returns {HTMLTemplateElement}
	 */
	function createTemplate() {
	const html = `

<style>

:where(div, span) {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
	border: 0;
}

.popup {
	--top: 20px;
	--left: 20px;
	--background-color: #FFFFFF;
	--font-family: Arial, serif;
	--font-size: 20px;
	--font-color: #282828;
	--close-button-color: #737373;
	--close-button-color-hover: #010101;
	position: fixed;
	top: var(--top);
	left: var(--left);
	padding: 6px 8px 6px 9px;
	background-color: var(--background-color);
	box-shadow: rgba(0, 0, 0, 0.6) -1px 1px 3px 1px;
	font-family: var(--font-family);
	font-size: var(--font-size);
	font-style: normal;
	font-weight: 400;
	line-height: 1.2;
	letter-spacing: .8px;
	word-spacing: 6px;
	text-wrap: wrap;
	text-wrap: pretty;
	color: var(--font-color);
	z-index: 999999;
}

.close {
	position: absolute;
	top: 0;
	left: 0;
	display: inline-block;
	padding: 0 1px 0;
	background-color: inherit;
	border: none;
	font: 12px/1.0 'Arial', sans-serif;
	font-style: normal;
	text-align: center;
	text-decoration: none;
	white-space: nowrap;
	color: var(--close-button-color);
	cursor: pointer;
	overflow: hidden;
}

.close:hover {
	color: var(--close-button-color-hover);
	background-color: transparent;
	transform: scale(1.5);
}

</style>

<div class="popup" data-role="popup">
	<span class="close" data-role="close">&#215;</span>
	<span data-role="text">Default text</span>
</div>

`;
		const template = document.createElement("template");
		template.id = "pronunciation-addon-popup-template";
		template.innerHTML = html;
		return template;
	}

	class IpaPopup {

		/**
		 * @param {string} ipa
		 * @param {OptionsIpa} options
		 * @param {"menuItem" | "action" | "other"} origin
		 */
		constructor(ipa, options, origin) {
			this.ipa = ipa;
			this.options = options;
			this.origin = origin;
			this.selection = window.getSelection();
			/**
			 * @type {HTMLElement | Node}
			 */
			this._target = null;
		}

		/**
		 * @returns {void}
		 */
		show() {
			showPopup(this.popupOptions());
		}

		/**
		 * @returns {Node | HTMLElement}
		 */
		target() {
			const s = this.selection;
			if (s.rangeCount > 0) {
				return (
					s.focusNode.nodeType === Node.ELEMENT_NODE ?
					s.focusNode :
					s.focusNode.parentElement
				);
			} else {
				return document.body;
			}
		}

		/**
		 * @returns {{ color: string, backgroundColor: string }}
		 */
		fontColors() {
			let color = this.options.font.color;
			let backgroundColor = this.options.font.backgroundColor;
			if (this.options.useContextColors) {
				const computed = window.getComputedStyle(this.target());
				// not 100%, but ok
				color = rgba2rgb(computed.color); // remove transparency
				backgroundColor = rgba2rgb(computed.backgroundColor); // default
				let element = this.target();
				while (element.parentElement) {
					const computed = window.getComputedStyle(element);
					const nonZero = filterDigits(computed.backgroundColor)
						.replaceAll("0", "");
					if (nonZero.length > 0) {
						backgroundColor = rgba2rgb(computed.backgroundColor);
						break;
					}
					element = element.parentElement;
				}
			}
			return { color, backgroundColor };
		}

		/**
		 * @returns {{ top: number, left: number }}
		 */
		position() {
			const s = this.selection;
			if (s.rangeCount > 0) {
				const { top, left } = s
					.getRangeAt(0)
					.getBoundingClientRect();
				let shiftTimes = -1.9;
				if (
					(
						(this.origin === "menuItem") &&
						(this.options.position.menuTriggered === "below")
					) ||
					(
						(this.origin === "action") &&
						(this.options.position.actionTriggered === "below")
					)
				) {
					shiftTimes = 2.5;
				}
				return {
					top: top + this.options.font.size * shiftTimes,
					left,
				};
			} else {
				return {
					top: 100,
					left: 250,
				};
			}
		}

		/**
		 * @returns {OptionsPopup}
		 */
		popupOptions() {
			/**
			 * @type {OptionsPopup}
			 */
			const options = {
				text: this.ipa,
				font: { ...this.options.font, ...this.fontColors() },
				close: this.options.close,
				position: this.position(),
			};
			return options;
		}

	}

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
	shadow.replaceChildren(...createAudioPlayerUI());
	shadow.appendChild(audio);
	document.body.appendChild(host);

	/**
	 * @param {string} id
	 * @returns {HTMLElement | null}
	 */
	const byId = (id) => shadow.getElementById(id);

	/**
	 * @type {AudioSource[]}
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
		close: byId("audio-player-close"),
	};

	let playerEnabled = false;
	let shortcutsEnabled = true;
	let action2shortcut = {};
	let shortcut2action = {};
	/**
	 * @type {OptAudioShortcuts}
	 */
	let defaultShortcuts = {
		togglePlayer: "t",
		togglePlay: "k",
		toggleMute: "m",
		previous: "p",
		next: "n",
		backward: "ArrowLeft",
		forward: "ArrowRight",
		decreaseVolume: "i",
		increaseVolume: "o",
		decreaseSpeed: "<",
		increaseSpeed: ">",
		resetSpeed: ";",
	};
	const action2function = {
		togglePlayer: async () => toggleAudioPlayer(),
		togglePlay: async () => togglePlayAudio(),
		toggleMute: async () => toggleMuteAudio(),
		previous: async () => previousAudio(),
		next: async () => nextAudio(),
		backward: async () => backwardAudio(2.3),
		forward: async () => forwardAudio(2),
		decreaseVolume: async () => changeAudioVolume(audio.volume - 0.05),
		increaseVolume: async () => changeAudioVolume(audio.volume + 0.05),
		decreaseSpeed: async () => changeAudioSpeed(audio.playbackRate - 0.1),
		increaseSpeed: async () => changeAudioSpeed(audio.playbackRate + 0.1),
		resetSpeed: async () => changeAudioSpeed(1),
	};

	setAudioControlShortcuts(defaultShortcuts);

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
		el.progressbar.max = audio.duration;
		el.totalTime.textContent = formatSeconds(audio.duration);
		changeAudioVolume(audio.volume);
		updateInputRangeBar(el.progressbar);
		changeAudioSpeed(audio.playbackRate);
	});

	audio.addEventListener("ended", async () => {
		await togglePlayAudio({ forcePause: true });
		el.totalTime.textContent = formatSeconds(audio.duration);
	});

	el.progressbar.addEventListener("input", () => {
		audio.currentTime = parseFloat(el.progressbar.value);
	});

	el.volumeControl.addEventListener("input", () => {
		audio.volume = parseFloat(el.volumeControl.value);
		updateInputRangeBar(el.volumeControl);
	});

	setInterval(() => {
		if (!audio.src) {
			return;
		}
		el.currentTime.textContent = formatSeconds(audio.currentTime);
		el.totalTime.textContent = formatSeconds(audio.duration);
		el.progressbar.value = audio.currentTime;
		updateInputRangeBar(el.progressbar);
	}, 250);

	el.togglePlayButton.addEventListener("click", async () => togglePlayAudio());
	el.toggleMuteButton.addEventListener("click", () => toggleMuteAudio());
	el.backward.addEventListener("click", () => backwardAudio(2.3));
	el.forward.addEventListener("click", () => forwardAudio(2));
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

	document.addEventListener("keydown", async (e) => {
		if (!shortcutsEnabled || sources.length === 0) {
			return;
		}
		const key = e.key.toUpperCase();
		if (!(key in shortcut2action)) {
			return;
		}
		e.preventDefault();
		const action = shortcut2action[key];
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
	async function toggleAudioPlayer({
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
			!playerEnabled :
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
		playerEnabled = enable;
	}

	/**
	 * @param {{
	 *     forceEnable: boolean,
	 *     forceDisable: boolean,
	 * }}
	 * @returns {void}
	 */
	function toggleAudioControlShortcuts({
		forceEnable=false,
		forceDisable=false,
	}={}) {
		shortcutsEnabled = (
			!forceEnable && !forceDisable ?
			!shortcutsEnabled :
			forceEnable
		);
	}

	/**
	 * @param {AudioSource} source
	 * @param {{
	 *     audio: HTMLAudioElement,
	 *     mainTitle: HTMLElement,
	 *     sources: AudioSource[],
	 *     togglePlayButton: HTMLElement,
	 *     playIcon: HTMLElement,
	 *     pauseIcon: HTMLElement,
	 *     play: boolean,
	 * }}
	 * @returns {Promise<AudioSource[]>}
	 */
	async function addAudioSource(source, {
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
	 * @param {OptAudioShortcuts} shortcuts
	 * @returns {void}
	 */
	function setAudioControlShortcuts(shortcuts={}) {
		action2shortcut = Object
			.entries({ ...defaultShortcuts, ...shortcuts })
			.reduce((obj, [key, value]) => {
				obj[key] = value.trim().toUpperCase();
				return obj;
			}, {});
		shortcut2action = Object
			.entries(action2shortcut)
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
	 * @param {number} seconds
	 * @param {{
	 *     audio: HTMLAudioElement,
	 * }}
	 * @returns {void}
	 */
	function forwardAudio(seconds, {
		audio=el.audio,
	}={}) {
		audio.currentTime = Math.min(
			audio.currentTime + seconds,
			audio.duration,
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
	 *     sources: AudioSource[],
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
	 *    sources: AudioSource[],
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
	 *    sources: AudioSource[],
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
			audio.currentTime = audio.duration;
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
		updateInputRangeBar(volumeControl);
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
	 * @param {HTMLInputElement} input
	 * @returns {void}
	 */
	function updateInputRangeBar(input) {
		const current = parseFloat(input.value);
		const max = parseFloat(input.max);
		const progress = (current / max) * 100;
		input.style.background = `
		linear-gradient(
			to right,
			var(--range-color) ${progress}%,
			var(--range-background) ${progress}%
		)
	`;
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
	 * @returns {HTMLElement[]}
	 */
	function createAudioPlayerUI() {
	const html = `

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
	-webkit-appearance: none;
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

.input-range::-webkit-slider-thumb {
	-webkit-appearance: none;
	appearance: none;
	height: var(--range-pointer-size);
	width: var(--range-pointer-size);
	background-color: var(--range-color);
	border-radius: 50%;
	border: none;
	transition: .1s linear;
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

@media screen and (max-width: 1000px) {

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
                <button id="audio-player-backward" class="audio-player-btn" title="Skip back 2 seconds">
                    <svg viewBox="0 0 16 16">
                        <path
                            d="M2.464 4.5h1.473a.75.75 0 0 1 0 1.5H0V2.063a.75.75 0 0 1 1.5 0v1.27a8.25 8.25 0 1 1 10.539 12.554.75.75 0 0 1-.828-1.25A6.75 6.75 0 1 0 2.464 4.5Z">
                        </path>
                        <path
                            d="M0,14.981c0.433,-0.344,0.06,-0.66,0.176,-0.946a2.15,2.15,0,0,1,0.517,-0.748c0.216,-0.2,0.474,-0.368,0.77,-0.506c0.315,-0.138,0.647,-0.26,0.99,-0.363c0.388,-0.118,0.737,-0.23,1.045,-0.33c0.315,-0.106,0.58,-0.222,0.792,-0.352c0.22,-0.137,0.39,-0.302,0.506,-0.495c0.125,-0.2,0.187,-0.437,0.187,-0.715c0,-0.228,-0.05,-0.426,-0.154,-0.594a1.02,1.02,0,0,0,-0.44,-0.363c-0.198,-0.087,-0.44,-0.13,-0.726,-0.13c-0.416,0,-0.75,0.11,-1,0.33c-0.243,0.212,-0.38,0.49,-0.407,0.836h-2.266c0.03,-0.548,0.186,-1.02,0.473,-1.419c0.293,-0.406,0.7,-0.726,1.22,-0.957c0.525,-0.237,1.13,-0.357,1.815,-0.357c0.583,0,1.095,0.074,1.54,0.22c0.45,0.14,0.83,0.336,1.144,0.583c0.312,0.247,0.55,0.537,0.715,0.869c0.166,0.326,0.248,0.685,0.248,1.078c0,0.507,-0.12,0.943,-0.363,1.309a2.16,2.16,0,0,1,-0.968,0.814a7.3,7.3,0,0,1,-1.045,0.374c-0.38,0.103,-0.715,0.207,-1.003,0.308c-0.272,0.094,-0.502,0.198,-0.693,0.308c-0.176,0.103,-0.307,0.22,-0.396,0.352c-0.081,0.126,-0.126,0.275,-0.132,0.451h5.074v1.155h-7.619v-0.712z">
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
                        <path
                            d="M8.21,14.981c0.433,-0.344,0.06,-0.66,0.176,-0.946a2.15,2.15,0,0,1,0.517,-0.748c0.216,-0.2,0.474,-0.368,0.77,-0.506c0.315,-0.138,0.647,-0.26,0.99,-0.363c0.388,-0.118,0.737,-0.23,1.045,-0.33c0.315,-0.106,0.58,-0.222,0.792,-0.352c0.22,-0.137,0.39,-0.302,0.506,-0.495c0.125,-0.2,0.187,-0.437,0.187,-0.715c0,-0.228,-0.05,-0.426,-0.154,-0.594a1.02,1.02,0,0,0,-0.44,-0.363c-0.198,-0.087,-0.44,-0.13,-0.726,-0.13c-0.416,0,-0.75,0.11,-1,0.33c-0.243,0.212,-0.38,0.49,-0.407,0.836h-2.266c0.03,-0.548,0.186,-1.02,0.473,-1.419c0.293,-0.406,0.7,-0.726,1.22,-0.957c0.525,-0.237,1.13,-0.357,1.815,-0.357c0.583,0,1.095,0.074,1.54,0.22c0.45,0.14,0.83,0.336,1.144,0.583c0.312,0.247,0.55,0.537,0.715,0.869c0.166,0.326,0.248,0.685,0.248,1.078c0,0.507,-0.12,0.943,-0.363,1.309a2.16,2.16,0,0,1,-0.968,0.814a7.3,7.3,0,0,1,-1.045,0.374c-0.38,0.103,-0.715,0.207,-1.003,0.308c-0.272,0.094,-0.502,0.198,-0.693,0.308c-0.176,0.103,-0.307,0.22,-0.396,0.352c-0.081,0.126,-0.126,0.275,-0.132,0.451h5.074v1.155h-7.619v-0.712z">
                        </path>
                    </svg>
                </button>
                <!-- keep center alignment -->
                <div class="audio-player-speed" style="visibility: hidden;">
                    <button class="audio-player-btn">1x</button>
                    <ul class="audio-player-speeds invisible">
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
            </div>
            <div class="audio-player-time">
                <span id="audio-player-current-time">0:00</span>
                <input id="audio-player-progresssbar" class="input-range" type="range" min="0" max="100" step="0.5"
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

	if (!browser.runtime.onMessage.hasListener(onMessage)) {
		browser.runtime.onMessage.addListener(onMessage);
	}

	/**
	 * @param {BackgroundMessage} message
	 * @returns {Promise<string | void>}
	 */
	async function onMessage(message) {
		const actions = {
			"showIpa": showIpa,
			"getSelectedText": getSelectedText,
			"playAudio": playAudio,
		};
		if (!message.type in actions) {
			throw new Error(`Invalid message type: ${message.type}`);
		}
		const value = await actions[message.type](message);
		return value;
	}

	/**
	 * @param {BackgroundMessage} message
	 * @returns {Promise<void>}
	 */
	async function showIpa(message) {
		const popup = new IpaPopup(
			message.showIpa.ipa,
			message.showIpa.options,
			message.origin,
		);
		return popup.show();
	}

	/**
	 * @param {BackgroundMessage} message
	 * @returns {Promise<string>}
	 */
	async function getSelectedText(message) {
		return window.getSelection().toString();
	}

	/**
	 * @param {BackgroundMessage} message
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

})();
