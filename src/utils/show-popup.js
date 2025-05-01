import { deepMerge }  from "./object.js";

const template = createTemplate();
document.body.appendChild(template);

/**
 * @type {OptionsPopup}
 */
export const defaultOptionsPopup = {
	text: "Default text",
	style: {
		font: {
			family: "Arial, serif",
			size: 20,
			color: "#282828",
		},
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
		centerHorizontally: true,
		centerVertically: false,
		top: 100,
		left: 250,
	},
};

/**
 * @param {OptionsPopup} options
 * @returns {void}
 */
export function showPopup(options) {

	/**
	 * @type {OptionsPopup}
	 */
	const opt = deepMerge(defaultOptionsPopup, options);
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

	setProperty("--background-color", opt.style.backgroundColor);
	setProperty("--font-family", opt.style.font.family);
	setProperty("--font-size", `${opt.style.font.size}px`);
	setProperty("--font-color", opt.style.font.color);
	setProperty("--close-button-color", opt.close.buttonColor);
	setProperty("--close-button-color-hover", opt.close.buttonHoverColor);

	popup.style.visibility = "hidden";
	document.body.appendChild(host);
	const rect = popup.getBoundingClientRect();
	const minMarge = 5;
	let popupWidth = rect.width;
	let popupHeight = rect.height;
	console.log({
		popupWidth: popupWidth,
		windowInnerWidth: window.innerWidth - minMarge,
	});
	if (popupWidth >= window.innerWidth - minMarge * 2) {
		console.log({ pronInfo: "popup width exceeds window width" });
		popupWidth = window.innerWidth - minMarge * 2;
		popup.style.width = `${popupWidth}px`;
		opt.position.centerHorizontally = true;
	}
	let left = opt.position.left;
	let top = opt.position.top;
	const widthDiff = (
		(window.innerWidth - minMarge) -
		(opt.position.left + popupWidth)
	);
	const heightDiff = (
		(window.innerHeight - minMarge) -
		(opt.position.top + popupHeight)
	);
	if (widthDiff < 0) {
		left += widthDiff;
	}
	if (heightDiff < 0) {
		top += heightDiff;
	}
	if (opt.position.centerHorizontally) {
		left = (window.innerWidth - popupWidth) / 2;
	}
	if (opt.position.centerVertically) {
		top = (window.innerHeight - popupHeight) / 2;
	}
	setProperty("--top", `${top}px`);
	setProperty("--left", `${left}px`);
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

<!-- Code injected by How2Say addon -->

<style>

:where(div, span) {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
	border: 0;
}

.popup {
	--top: 0px;
	--left: 0px;
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
