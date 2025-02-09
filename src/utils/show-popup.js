/**
 * @type {OptionsPopup}
 */
export const defaultOptionsPopup = {
	target: document.body,
	text: "default text",
	font: {
		family: "Arial",
		size: 20,
		color: "#282828",
		backgroundColor: "#FFFFFF",
	},
	close: {
		timeout: 3000,
		shortcut: "\\",
		onScroll: false,
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
export function showPopup(options) {
	/**
	 * @type {OptionsPopup}
	 */
	const opt = { ...defaultOptionsPopup, ...options };
	const popup = document.createElement("div");
	const closeButton = document.createElement("span");
	const closeColor = "#737373";
	const timeoutId = setTimeout(closePopup, opt.close.timeout);
	console.log({ pronuciationPopupText: opt.text });
	popup.style.cssText = `
		position: fixed;
		top: ${opt.position.top}px;
		left: ${opt.position.left}px;
		box-sizing: border-box;
		padding: 6px 8px 6px 9px;
		background-color: ${opt.font.backgroundColor};
		box-shadow: rgba(0, 0, 0, 0.6) -1px 1px 3px 1px;
		font-family: ${opt.font.family}, serif;
		font-size: ${opt.font.size}px;
		font-weight: 400;
		line-height: 1.2;
		letter-spacing: .8px;
		word-spacing: 6px;
		color: ${opt.font.color};
		z-index: 99999 !important;
	`;
	closeButton.style.cssText = `
		position: absolute;
		top: 0;
		left: 0;
		display: inline-block;
		padding: 0 1px 0;
		background-color: inherit;
		border: none;
		font: 12px/1.0 'Arial', sans-serif;
		vertical-align: middle;
		text-align: center;
		text-decoration: none;
		white-space: nowrap;
		color: ${closeColor};
		cursor: pointer;
		overflow: hidden;
	`;
	closeButton.appendChild(document.createTextNode("\u00D7"));
	popup.appendChild(document.createTextNode(opt.text));
	popup.appendChild(closeButton);

	const onMouseOver = () => { closeButton.style.color = "#111111"; };
	const onMouseLeave = () => { closeButton.style.color = closeColor; };
	const onScroll = () => { opt.close.onScroll && closePopup(); };
	/**
	 * @param {KeyboardEvent} event
	 * @returns {void}
	 */
	const onKeyDown = (event) => {
		if (event.key.toUpperCase() === opt.close.shortcut) {
			closePopup();
		};
	};

	function disableTimeout() {
		clearTimeout(timeoutId);
		popup.removeEventListener("mousedown", disableTimeout);
		document.removeEventListener("scroll", onScroll);
	}

	function closePopup() {
		popup.removeEventListener("mousedown", disableTimeout);
		closeButton.removeEventListener("click", closePopup);
		closeButton.removeEventListener("mouseover", onMouseOver);
		closeButton.removeEventListener("mouseleave", onMouseLeave);
		document.removeEventListener("keydown", onKeyDown);
		document.removeEventListener("scroll", onScroll);
		popup.remove();
	}

	popup.addEventListener("mousedown", disableTimeout);
	closeButton.addEventListener("click", closePopup);
	closeButton.addEventListener("mouseover", onMouseOver);
	closeButton.addEventListener("mouseleave", onMouseLeave);
	document.addEventListener("keydown", onKeyDown);
	document.addEventListener("scroll", onScroll);

	opt.target.appendChild(popup);
}
