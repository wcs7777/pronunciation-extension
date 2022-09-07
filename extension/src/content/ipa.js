import showPopup from "../show-popup.js"
import { getStyle, getInheritedBackgroundColor, rgba2rgb } from "../utils.js";

const element = getFocusElement();
showPopup({
	message,
	timeout,
	font: {
		family,
		sizepx,
	},
	position: getPopupPosition(getTopCorrection()),
	backgroundColor: backgroundColor(element),
	color: color(element),
});

function getTopCorrection() {
	return parseFloat(sizepx) * 1.8;
}

function backgroundColor(element) {
	return (
		!useWordColors ?
		undefined :
		rgba2rgb(getInheritedBackgroundColor(element))
	);
}

function color(element) {
	return (
		!useWordColors ?
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
