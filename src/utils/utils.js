export function $(selectors, target=document) {
	return target.querySelector(selectors);
}

export function $$(selectors, target=document) {
	return Array.from(target.querySelectorAll(selectors));
}

export function byId(elementId) {
	return document.getElementById(elementId);
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

export function onAppend({
	selectors,
	target=document.body,
	options={ childList: true },
	listener,
	errorLogger=console.error,
}={}) {
	const mutation = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			const addedNodes = Array.from(mutation.addedNodes);
			let nodes = [];
			if (addedNodes.length > 0) {
				if (selectors) {
					nodes = $$(selectors, target).filter((element) => {
						return addedNodes.some((added) => {
							return added.contains(element);
						});
					});
				} else {
					nodes = addedNodes;
				}
			}
			if (nodes.length > 0) {
				listener(nodes, mutation.target)?.catch(errorLogger);
				break;
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

export function digits() {
	return "0123456789";
}

export function alphanumeric() {
	return letters() + digits();
}

export function symbolsFragment() {
	return "_";
}

export function isLetter(character) {
	return letters().indexOf(character) > -1;
}

export function isNumber(character) {
	return digits().indexOf(character) > -1;
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

export function isString(value) {
  return Object.prototype.toString.call(value) === "[object String]"
}

export function sorted(...values) {
	for (let i = 1; i < values.length; ++i) {
		if (values[i - 1] > values[i]) {
			return false;
		}
	}
	return true;
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
		reader.addEventListener("load", onLoad);
		reader.addEventListener("error", onError);
		reader.readAsDataURL(blob);

		function onLoad(e) {
			removeListeners();
			return resolve(e.target.result);
		}

		function onError(error) {
			removeListeners();
			return reject(error);
		}

		function removeListeners() {
			reader.removeEventListener("load", onLoad);
			reader.removeEventListener("error", onError);
		}
	});
}

export function url2audio(url) {
	return new Promise((resolve, reject) => {
		const audio = new Audio(url);
		audio.addEventListener("canplay", onCanPlay);
		audio.addEventListener("error", onError);

		function onCanPlay() {
			removeListeners();
			return resolve(audio);
		}

		function onError(error) {
			removeListeners();
			return reject(error);
		}

		function removeListeners() {
			audio.removeEventListener("canplay", onCanPlay);
			audio.removeEventListener("error", onError);
		}
	});
}

export function file2object(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener("load", onLoad);
		reader.addEventListener("error", onError);
		reader.readAsText(file);

		function onLoad(e) {
			removeListeners();
			try {
				return resolve(JSON.parse(e.target.result));
			} catch (error) {
				return reject(error);
			}
		}

		function onError(error) {
			removeListeners();
			return reject(error);
		}

		function removeListeners() {
			reader.removeEventListener("load", onLoad);
			reader.removeEventListener("error", onError);
		}
	});
}

export function object2blob(obj) {
	return new Blob(
		[JSON.stringify(obj, null, 2)],
		{ type: "application/json" },
	);
}

export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function delayReject(timeout, reason) {
	return new Promise((_, reject) => {
		return setTimeout(() => reject(reason), timeout);
	});
}

export function promiseTimeoutReject(promise, timeout, reason) {
	return Promise.race([promise, delayReject(timeout, reason)]);
}

export function untilResolve(promises) {
	return new Promise(async (resolve, reject) => {
		const reasons = [];
		for (const promise of promises) {
			try {
				return resolve(await promise());
			} catch (reason) {
				reasons.push(reason);
			}
		}
		return reject(reasons);
	});
}

export async function asyncReduce(arr, initialValue, callback) {
	let currentValue = initialValue;
	for (const element of arr) {
		currentValue = await callback(currentValue, element);
	}
	return currentValue;
}
