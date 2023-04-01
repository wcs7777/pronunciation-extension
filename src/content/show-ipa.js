import showPopup from "../utils/show-popup.js";
import { getInheritedBackgroundColor, getStyle, rgba2rgb } from "../utils/utils.js";

export default function showIpa({
	ipa="ipa",
	ipaTimeout=3000,
	ipaFontFamily="Arial",
	ipaFontSizePx=20,
	ipaCloseShortcut="\\",
	ipaCloseOnScroll=true,
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
		backgroundColor: backgroundColor(element),
		color: color(element),
		closeShortcut: ipaCloseShortcut,
		closeOnScroll: ipaCloseOnScroll,
	});
}

function getTopCorrection(ipaFontSizePx) {
	return parseFloat(ipaFontSizePx) * 2;
}

function backgroundColor(element) {
	return (
		!ipaUseContextColors ?
		undefined :
		rgba2rgb(getInheritedBackgroundColor(element))
	);
}

function color(element) {
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
