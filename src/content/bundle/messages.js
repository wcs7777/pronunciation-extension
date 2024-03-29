(function () {
	'use strict';

	function tag(tagName) {
		return document.createElement(tagName);
	}

	function textNode(data) {
		return document.createTextNode(data);
	}

	function getInheritedBackgroundColor(
		element,
		defaultStyle=getBackgroundColorInitialValue(),
	) {
		const backgroundColor = getStyle(element, "background-color");
		if (backgroundColor !== defaultStyle || !element.parentElement) {
			return backgroundColor;
		} else {
			return getInheritedBackgroundColor(element.parentElement, defaultStyle);
		}
	}

	function getBackgroundColorInitialValue() {
		const div = tag("div");
		document.head.appendChild(div);
		const backgroundColor = getStyle(div, "background-color");
		div.remove();
		return backgroundColor;
	}

	function getStyle(element, style) {
		const computed = window.getComputedStyle(element);
		return (
			style.includes("-") ?
			computed.getPropertyValue(style) :
			computed[style]
		);
	}

	function rgba2rgb(rgba) {
		if (rgba.startsWith("rgba")) {
			return rgba
				.replace("a", "")
				.slice(0, rgba.lastIndexOf(",") - 1)
				.concat(")");
		} else {
			return rgba;
		}
	}

	function showPopup({
		message="message",
		timeout=3000,
		position={
			top: 100,
			left: 250,
		},
		font={
			family: "Arial",
			sizepx: 20,
		},
		target=document.body,
		color="rgb(40, 40, 40)",
		backgroundColor="rgb(255, 255, 255)",
		closeShortcut="\\",
		closeOnScroll=false,
	}={}) {
		const popup = tag("div");
		const closeButton = tag("span");
		const closeButtonColor = "#737373";
		const timeoutID  = setTimeout(closePopup, timeout);
		popup.style.cssText = `
		position: fixed;
		top: ${position.top}px;
		left: ${position.left}px;
		padding: 6px 12px 6px 8px;
		box-sizing: border-box;
		color: ${color};
		background-color: ${backgroundColor};
		box-shadow: rgba(0, 0, 0, 0.6) -1px 1px 3px 1px;
		font: ${font.sizepx}px/1.2 "${font.family}", serif;
		letter-spacing: .8px;
		z-index: 99999;
	`;
		closeButton.style.cssText = `
		position: absolute;
		top: 0;
		right: 0;
		display: inline-block;
		padding: 0 1px 0;
		vertical-align: middle;
		color: ${closeButtonColor};
		background-color: inherit;
		border: none;
		font: 12px/1.0 "Arial", sans-serif;
		text-align: center;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		overflow: hidden;
	`;
		closeButton.appendChild(textNode("\u00D7"));
		popup.appendChild(textNode(message));
		popup.appendChild(closeButton);
		popup.addEventListener("mousedown", disableTimeout);
		closeButton.addEventListener("click", closePopup);
		closeButton.addEventListener("mouseover", onMouseOver);
		closeButton.addEventListener("mouseleave", onMouseLeave);
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("scroll", onScroll);
		target.appendChild(popup);

		function disableTimeout() {
			clearTimeout(timeoutID);
			popup.removeEventListener("mousedown", disableTimeout);
			document.removeEventListener("scroll", onScroll);
		}

		function onMouseOver() {
			closeButton.style.color = "#111111";
		}

		function onMouseLeave() {
			closeButton.style.color = closeButtonColor;
		}

		function onKeyDown(e) {
			if (e.key.toUpperCase() === closeShortcut) {
				closePopup();
			}
		}

		function onScroll() {
			if (closeOnScroll) {
				closePopup();
			}
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
	}

	if (!browser.runtime.onMessage.hasListener(onMessage)) {
		browser.runtime.onMessage.addListener(onMessage);
	}

	function onMessage(message) {
		if (message.showIpaOptions) {
			showIpa(message.showIpaOptions);
		} else if (message.getSelectionText) {
			return Promise.resolve(getSelectionText());
		}
	}

	function showIpa({
		ipa="ipa",
		ipaTimeout=3000,
		ipaFontFamily="Arial",
		ipaFontSizePx=20,
		ipaCloseShortcut="\\",
		ipaCloseOnScroll=true,
		ipaUseContextColors=false,
	}) {
		const element = getFocusElement();
		showPopup({
			message: ipa,
			timeout: ipaTimeout,
			font: {
				family: ipaFontFamily,
				sizepx: ipaFontSizePx,
			},
			position: getPopupPosition(getTopCorrection(ipaFontSizePx)),
			backgroundColor: backgroundColor(element, ipaUseContextColors),
			color: color(element, ipaUseContextColors),
			closeShortcut: ipaCloseShortcut,
			closeOnScroll: ipaCloseOnScroll,
		});
	}

	function getTopCorrection(ipaFontSizePx) {
		return parseFloat(ipaFontSizePx) * 2;
	}

	function backgroundColor(element, ipaUseContextColors) {
		return (
			!ipaUseContextColors ?
			undefined :
			rgba2rgb(getInheritedBackgroundColor(element))
		);
	}

	function color(element, ipaUseContextColors) {
		return (
			!ipaUseContextColors ?
			undefined :
			rgba2rgb(getStyle(element, "color"))
		);
	}

	function getFocusElement() {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			return (
				selection.focusNode.nodeType === Node.ELEMENT_NODE ?
				selection.focusNode :
				selection.focusNode.parentElement
			);
		} else {
			return document.body;
		}
	}

	function getPopupPosition(
		topCorrection=45,
		fallbackPosition={ top: 100, left: 250 },
	) {
		const selection = window.getSelection();
		if (selection.rangeCount > 0) {
			const { top, left } = selection.getRangeAt(0).getBoundingClientRect();
			return {
				top: top - topCorrection,
				left,
			};
		} else {
			return fallbackPosition;
		}
	}

	function getSelectionText() {
		return window.getSelection().toString();
	}

})();
