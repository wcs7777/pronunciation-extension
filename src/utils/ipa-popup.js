import { filterDigits, rgba2rgb } from "./string.js";
import { showPopup } from "./show-popup.js";

export default class IpaPopup {

	/**
	 * @param {string} ipa
	 * @param {PopupPosition} position
	 * @param {OptionsIpa} options
	 */
	constructor(ipa, position, options) {
		this.ipa = ipa;
		this.position = position;
		this.options = options;
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
		const s = this.window.getSelection();
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
	 * @returns {{ font: { color: string }, backgroundColor: string }}
	 */
	style() {
		let color = this.options.style.font.color;
		let backgroundColor = this.options.style.backgroundColor;
		if (this.options.style.useContextColors) {
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
		return { font: { color }, backgroundColor };
	}

	/**
	 * @returns {OptionsPopup}
	 */
	popupOptions() {
		const style = this.style();
		/**
		 * @type {OptionsPopup}
		 */
		const options = {
			text: this.ipa,
			style: {
				font: {
					...this.options.style.font,
					color: style.font.color,
				},
				backgroundColor: style.backgroundColor,
			},
			close: this.options.close,
			position: this.position,
		};
		return options;
	}

}
