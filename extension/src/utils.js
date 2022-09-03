export function $(selectors, target=document) {
	return target.querySelector(selectors);
}

export function $$(selectors, target=document) {
	return Array.from(target.querySelectorAll(selectors));
}

export function tag(tagName) {
	return document.createElement(tagName);
}

export function textNode(data) {
	return document.createTextNode(data);
}

export function getInheritedBackgroundColor(
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

export function getBackgroundColorInitialValue() {
	const div = tag("div");
	document.head.appendChild(div);
	const backgroundColor = getStyle(div, "background-color");
	div.remove();
	return backgroundColor;
}

export function getStyle(element, style) {
	const computed = window.getComputedStyle(element);
	return (
		style.includes("-") ?
		computed.getPropertyValue(style) :
		computed[style]
	);
}

export function rgba2rgb(rgba) {
	if (rgba.startsWith("rgba")) {
		return rgba
			.replace("a", "")
			.slice(0, rgba.lastIndexOf(",") - 1)
			.concat(")");
	} else {
		return rgba;
	}
}

export function onAppend(target, options, listener) {
	const mutation = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.addedNodes.length > 0) {
				listener(Array.from(mutation.addedNodes), mutation.target);
			}
		}
	});
	mutation.observe(target, options);
	return mutation;
}

export function isNodeType(node, type) {
	return node.nodeName.toUpperCase() === type.toUpperCase();
}

export function normalizeWord(word) {
	return word
		.trim()
		.toLowerCase()
		.replaceAll(/(\.|,|\?|!|")/g, '')
		.replaceAll("’", "'")
		.split(/\s+/)[0];
}

export function replaceQuotesByUnderline(word) {
	return word.replaceAll("'", "_").replaceAll("’", "_");
}

export function letters() {
	return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
}

export function numbers() {
	return "0123456789";
}

export function alphanumeric() {
	return letters() + numbers();
}

export function symbolsFragment() {
	return "_";
}

export function isLetter(character) {
	return letters().indexOf(character) > -1;
}

export function isNumber(character) {
	return numbers().indexOf(character) > -1;
}

export function isAlphanumeric(character) {
	return isLetter(character) || isNumber(character);
}

export function toArray(value) {
	return Array.isArray(value) ? value : [value];
}

export function toObject(value) {
	return typeof value === "object" ? value : { [value]: value };
}

export function print(message) {
	console.clear();
	console.log(message);
}

export function log(obj) {
	separator();
	console.log(obj);
	separator();
}

export function separator() {
	console.log("-".repeat(80));
}

export function isTooManyRequests(statusCode) {
	// 408 == Request Timeout
	// 429 == Too Many Requests
	return statusCode == 429;
}

export function isString(value) {
  return Object.prototype.toString.call(value) === "[object String]"
}

export async function url2document(url, credentials="omit") {
	const response = await fetch(url, { credentials });
	if (response.status !== 200) {
		throw response.status;
	}
	const text = await response.text();
	return new DOMParser().parseFromString(text, "text/html");
}

export async function url2base64(url, credentials="omit") {
	const response = await fetch(url, { credentials });
	return blob2base64(await response.blob());
}

export function blob2base64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = reject;
		reader.onload = (e) => resolve(e.target.result);
		reader.readAsDataURL(blob);
	});
}

export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function delayResolve(timeout, value) {
	return new Promise((resolve) => {
		return setTimeout(() => resolve(value), timeout);
	});
}

export function promiseTimeout(promise, timeout, defaultValue) {
	return Promise.race([
		promise,
		delayResolve(timeout, defaultValue),
	]);
}

export async function asyncReduce(arr, initialValue, callback) {
	let currentValue = initialValue;
	for (const element of arr) {
		currentValue = await callback(currentValue, element);
	}
	return currentValue;
}
