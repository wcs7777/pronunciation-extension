import "../utils/fflate.js";
import * as af from "../audio-from.js";
import * as pf from "../ipa-from.js";
import MemoryCache from "../utils/memory-cache.js";
import TableByKeyPrefix from "../utils/table-by-key-prefix.js";
import TableByParentKey from "../utils/table-by-parent-key.js";

async function testAudio() {
	const word = "literally";
	console.log("\n".repeat(3));
	for (const [name, fn] of [
		["audioFromGstatic", af.audioFromGstatic],
		["audioFromOxford", af.audioFromOxford],
		["audioFromGoogleDefine", af.audioFromGoogleDefine], // cors error
		["audioFromGoogleSpeech", af.audioFromGoogleSpeech],
		["audioFromResponsiveVoice", af.audioFromResponsiveVoice],
	]) {
		try {
			console.log("\n".repeat(3));
			console.log({ name });
			/**
			 * @type {HTMLAudioElement}
			 */
			const audio = await fn(word);
			console.log(audio);
			await audio.play();
			console.info(`Success: ${name}`);
		} catch (e) {
			console.error(e);
			console.info(`Error: ${name}`);
		} finally {
			console.log("\n".repeat(3));
		}
	}
}

async function testIpa() {
	const word = "literally";
	console.log("\n".repeat(3));
	for (const [name, fn] of [
		["ipaFromOxford", pf.ipaFromOxford],
		["ipaFromCambridge", pf.ipaFromCambridge],
		["ipaFromUnalengua", pf.ipaFromUnalengua],
	]) {
		try {
			console.log("\n".repeat(3));
			console.log({ name });
			/**
			 * @type {string}
			 */
			const ipa = await fn(word);
			console.log({ ipa });
			console.info(`Success: ${name}`);
		} catch (e) {
			console.error(e);
			console.info(`Error: ${name}`);
		} finally {
			console.log("\n".repeat(3));
		}
	}
}

async function testIpaDecompress() {
	/**
	 * @type {Uint8Array}
	 */
	const url = browser.runtime.getURL("resources/initial-ipa.json.gz");
	const response = await fetch(url);
	const ipaArray = new Uint8Array(await response.arrayBuffer());
	console.log(ipaArray);
	const decompressed = fflate.decompressSync(ipaArray);
	/**
	  * @type {{[key: string]: string}}
	  */
	const ipaDefinitions = JSON.parse(new TextDecoder().decode(decompressed));
	console.log(decompressed);
	console.log(ipaDefinitions);
	console.log(Object.keys(ipaDefinitions).length);
}

async function testMemoryCache() {
	const cache = new MemoryCache();
	const key = 'foo';
	const value = 'bar';
	cache.set(key, value);
	const hasValue = cache.hasKey(key);
	console.log({ hasValue });
	console.log(cache.hasKey("baz"));
	const retrieved = cache.get(key);
	console.log({ retrieved });
	console.log(value === retrieved);
	cache.clear();
	const missing = cache.get("baz");
	console.log({ missing });
}

async function testTableByKeyPrefix() {
	const keyPrefix = "a";
	const table = new TableByKeyPrefix(browser.storage.local, keyPrefix);
	await table.set("first", "together");
	await table.setMany({
		first: "changed",
		second: "challeging",
		third: "memorize",
		afourth: "abc",
	});
	console.log("get1", await table.get("first"));
	console.log("get2", await table.get(["first", "second"]));
	console.log("get3", await table.get([]));
	console.log("get4", await table.get(null));
	console.log("get5", await table.get("afourth"));
	console.log("getAll1", await table.getAll());
	console.log("getValue1", await table.getValue("second"));
	console.log("getValues1", await table.getValues("first"));
	console.log("getValues2", await table.getValues(["first", "second", "third", "fourth"]));
	console.log("getKeys", await table.getKeys());
	await table.remove("sixth");
	await table.remove(["first", "second"]);
	// console.log("getValue2", await table.getValue("second"));
	console.log("getAll2", await table.getAll());
	await table.clear();
	console.log("getAll3", await table.getAll());
}

async function testTableByParentKey() {
	const parentKey = "someKey";
	const table = new TableByParentKey(browser.storage.local, parentKey);
	await table.set("first", "together");
	await table.setMany({
		first: "changed",
		second: "challeging",
		third: "memorize",
		afourth: "abc",
	});
	console.log("get1", await table.get("first"));
	console.log("get2", await table.get(["first", "second"]));
	console.log("get3", await table.get([]));
	console.log("get4", await table.get(null));
	console.log("get5", await table.get("afourth"));
	console.log("getAll1", await table.getAll());
	console.log("getValue1", await table.getValue("second"));
	console.log("getValues1", await table.getValues("first"));
	console.log("getValues2", await table.getValues(["first", "second", "third", "fourth"]));
	console.log("getKeys", await table.getKeys());
	await table.remove("sixth");
	await table.remove(["first", "second"]);
	// console.log("getValue2", await table.getValue("second"));
	console.log("getAll2", await table.getAll());
	await table.clear();
	console.log("getAll3", await table.getAll());
}

async function main() {
	console.log("pronunciation test begin");
	await browser.storage.local.clear();
	await browser.storage.local.set({ shouldRemain: "value" });
	console.log("storage", await browser.storage.local.get());
	// await testAudio();
	// await testIpa();
	// await testIpaDecompress();
	// await testMemoryCache();
	await testTableByKeyPrefix();
	await testTableByParentKey();
	console.log("storage", await browser.storage.local.get());
	console.log("pronunciation test end");
}

(async() => main())().catch(console.error);
