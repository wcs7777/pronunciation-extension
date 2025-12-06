import defaultOptions from "../../utils/default-options.js";
import { byId, onlyNumber } from "../../utils/element.js";
import { getAllOptions, numOr, saveOptions, showInfo, strOr } from "./utils.js";

/**
 * @type {{
 *     fontFamily: HTMLInputElement,
 *     fontSize: HTMLInputElement,
 *     fontColor: HTMLInputElement,
 *     backgroundColor: HTMLInputElement,
 *     useContextColors: HTMLInputElement,
 *     save: HTMLButtonElement,
 * }}
 */
const el = {
	fontFamily: byId("fontFamily"),
	fontSize: byId("fontSize"),
	fontColor: byId("fontColor"),
	backgroundColor: byId("backgroundColor"),
	useContextColors: byId("useContextColors"),
	save: byId("save"),
};

document.addEventListener("DOMContentLoaded", async () => {
	try {
		onlyNumber(el.fontSize, true);
		await setFieldsValues();
	} catch (error) {
		console.error(error);
	}
});

el.save.addEventListener("click", async () => {
	try {
		const defaultStyle = defaultOptions.ipa.style;
		/** @type {Options} */
		const options = {
			ipa: {
				font: {
					family: strOr(el.fontFamily.value, defaultStyle.font.family),
					size: numOr(el.fontSize.value, defaultStyle.font.size, 2, 50),
					color: strOr(el.fontColor.value, defaultStyle.font.color),
				},
				backgroundColor: strOr(el.backgroundColor.value, defaultStyle.backgroundColor),
				useContextColors: el.useContextColors.checked,
			},
		};
		await saveOptions(options);
		await setFieldsValues();
		showInfo("IPA Style settings saved");
	} catch (error) {
		console.error(error);
	}
});

/**
 * @returns {Promise<void>}
 */
async function setFieldsValues() {
	/** @type {Options} */
	const opt = await getAllOptions();
	el.fontFamily.value = opt.ipa.style.font.family;
	el.fontSize.value = opt.ipa.style.font.size.toString();
	el.fontColor.value = opt.ipa.style.font.color;
	el.backgroundColor.value = opt.ipa.style.backgroundColor;
	el.useContextColors.checked = opt.ipa.style.useContextColors;
}
