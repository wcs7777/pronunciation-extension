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

	/**
	 * @type {OptionsPopup}
	 */
	const defaultOptionsPopup = {
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
	function showPopup(options) {
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
			}	};

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
				let shift = this.options.font.size * 1.2;
				if (
					(
						(this.origin === "menuItem") &&
						(this.options.position.menuTriggered == "above")
					) ||
					(
						(this.origin === "action") &&
						(this.options.position.actionTriggered == "above")
					)
				) {
					shift *= -1.8;
				}
				return { top: top + shift, left };
			} else {
				return { top: 100, left: 250 };
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
				target: this.target(),
				text: this.ipa,
				font: { ...this.options.font, ...this.fontColors() },
				close: this.options.close,
				position: this.position(),
			};
			return options;
		}

	}

	if (!browser.runtime.onMessage.hasListener(onMessage)) {
		browser.runtime.onMessage.addListener(onMessage);
	}

	/**
	 * @param {BackgroundMessage} message
	 * @returns {Promise<string | void>}
	 */
	async function onMessage(message) {
		if (message.type === "showIpa") {
			const popup = new IpaPopup(
				message.showIpa.ipa,
				message.showIpa.options,
				message.origin,
			);
			return popup.show();
		} else if (message.type === "getSelectedText") {
			return window.getSelection().toString();
		} else {
			throw new Error(`Invalid message: ${message}`);
		}
	}

})();
