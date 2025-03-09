export class AwsFetcher {
	
	#authorization = null;
	#signature = null;
	#stringToSign = null;
	#hashedCanonicalRequest = null;
	#canonicalRequest = null;
	#credentialScope = null;
	#httpMethod = null;
	#canonicalUri = null;
	#canonicalQueryString = null;
	#canonicalHeaders = null;
	#signedHeaders = null;
	#hashedPayload = null;
	#service = null;
	#region = null;
	#url = null;
	#initHeaders = null;
	#headersToSign = null;
	#body = null;
	#canonicalHeadersEntries = null;
	#datestamp = null;
	#timestamp = null;

	/**
	 * @param {string} input
	 * @param {{
	 *     accessKeyId: string,
	 *     secretAccessKey: string,
	 *     service?: string,
	 *     region?: string,
	 *     date?: Date,
	 *     ignoreHeaders?: string[],
	 * }} awsOpt
	 * @param {RequestInit} init
	 */
	constructor(input, awsOpt, init) {
		this.input = input;
		this.awsOpt = awsOpt;
		this.accessKeyId = awsOpt.accessKeyId;
		this.secretAccessKey = awsOpt.secretAccessKey;
		this.date = awsOpt.date ?? new Date();
		this.ignoreHeaders = Array
			.from(
				awsOpt.ignoreHeaders ??
				[
					"authorization",
					"connection",
					"x-amzn-trace-id",
					"user-agent",
					"expect",
					"presigned-expires",
					"range",
				]
			)
			.map(h => h.toLowerCase().trim());
		this.init = init;
	}

	/**
	 * @returns {Promise<Response>}
	 */
	async fetch() {
		const headers = {
			...Object.fromEntries(this.initHeaders.entries()),
			...Object.fromEntries(this.canonicalHeadersEntries),
			authorization: await this.createAuthorization(),
		};
		const init = { ...this.init, headers };
		return fetch(this.url, init);
	}

	/**
	 * @returns {Promise<string>}
	 */
	async createAuthorization() {
		if (this.#authorization) {
			return this.#authorization;
		}
		const credential = `${this.accessKeyId}/${this.credentialScope}`;
		const signature = await this.calculateSignature();
		this.#authorization = [
			`AWS4-HMAC-SHA256 Credential=${credential}`,
			`SignedHeaders=${this.signedHeaders}`,
			`Signature=${signature}`,
		].join(", ");
		return this.#authorization;
	}

	/**
	 * @returns {Promise<string>}
	 */
	async calculateSignature() {
		if (this.#signature) {
			return this.#signature;
		}
		const dateKey = await sign(
			new TextEncoder("utf-8").encode(`AWS4${this.secretAccessKey}`),
			this.datestamp,
		);
		const dateRegionKey = await sign(
			dateKey,
			this.region,
		);
		const dateRegionServiceKey = await sign(
			dateRegionKey,
			this.service,
		);
		const signingKey = await sign(
			dateRegionServiceKey,
			"aws4_request",
		);
		const signature = await sign(
			signingKey,
			await this.createStringToSign(),
		);
		this.#signature = buffer2hex(signature);
		return this.#signature;
	}

	/**
	 * @returns {Promise<string>}
	 */
	async createStringToSign() {
		if (this.#stringToSign) {
			return this.#stringToSign;
		}
		this.#stringToSign = [
			"AWS4-HMAC-SHA256",
			this.timestamp,
			this.credentialScope,
			await this.hashCanonicalRequest(),
		].join("\n");
		return this.#stringToSign;
	}

	/**
	 * @returns {Promise<string>}
	 */
	async hashCanonicalRequest() {
		if (this.#hashedCanonicalRequest) {
			return this.#hashedCanonicalRequest;
		}
		const canonicalRequest = await this.canonizeRequest();
		const buffer = await digest(canonicalRequest);
		this.#hashedCanonicalRequest = buffer2hex(buffer);
		return this.#hashedCanonicalRequest;
	}

	/**
	 * @returns {Promise<string>}
	 */
	async canonizeRequest() {
		if (this.#canonicalRequest) {
			return this.#canonicalRequest;
		}
		this.#canonicalRequest = [
			this.httpMethod,
			this.canonicalUri,
			this.canonicalQueryString,
			this.canonicalHeaders,
			this.signedHeaders,
			await this.hashPayload(),
		].join("\n");
		return this.#canonicalRequest;
	}

	/**
	 * @returns {string}
	 */
	get credentialScope() {
		if (this.#credentialScope) {
			return this.#credentialScope;
		}
		this.#credentialScope = [
			this.datestamp,
			this.region,
			this.service,
			"aws4_request",
		].join("/");
		return this.#credentialScope;
	}

	/**
	 * @returns {string}
	 */
	get httpMethod() {
		if (this.#httpMethod) {
			return this.#httpMethod;
		}
		this.#httpMethod = this.init?.method?.toUpperCase() ?? "GET";
		return this.#httpMethod;
	}

	/**
	 * @returns {string}
	 */
	get canonicalUri() {
		if (this.#canonicalUri) {
			return this.#canonicalUri;
		}
		this.#canonicalUri = uriEncode(this.url.pathname, true);
		return this.#canonicalUri;
	}

	/**
	 * @returns {string}
	 */
	get canonicalQueryString() {
		if (this.#canonicalQueryString) {
			return this.#canonicalQueryString;
		}
		this.#canonicalQueryString = Array.from(
			this.url.searchParams.entries()
		)
			.map(([key, value]) => {
				const k = uriEncode(key, false);
				const v = uriEncode(value.toString(), false);
				return [k, v];
			})
			.toSorted(([left, _], [right, __]) => {
				return (
					left < right ? -1 :
					left > right ? 1 : 0
				);
			})
			.map(([key, value]) => `${key}=${value}`)
			.join("&");
		return this.#canonicalQueryString;
	}

	/**
	 * @returns {string}
	 */
	get canonicalHeaders() {
		if (this.#canonicalHeaders) {
			return this.#canonicalHeaders;
		}
		this.#canonicalHeaders = this.canonicalHeadersEntries
			.map(([k, v]) => `${k}:${v}`)
			.join("\n") + "\n";
		return this.#canonicalHeaders;
	}

	/**
	 * @returns {string}
	 */
	get signedHeaders() {
		if (this.#signedHeaders) {
			return this.#signedHeaders;
		}
		this.#signedHeaders = this.canonicalHeadersEntries
			.map(([k, _]) => k)
			.join(";");
		return this.#signedHeaders;
	}

	/**
	 * @returns {Promise<string>}
	 */
	async hashPayload() {
		if (this.#hashedPayload) {
			return this.#hashedPayload;
		}
		this.#hashedPayload = buffer2hex(await digest(this.body));
		return this.#hashedPayload;
	}

	/**
	 * @returns {service}
	 */
	get service() {
		if (this.#service) {
			return this.#service;
		}
		this.#service = (
			this.awsOpt.service ??
			this.url.hostname.split('.', 1)[0]
		);
		return this.#service;
	}

	/**
	 * @returns {region}
	 */
	get region() {
		if (this.#region) {
			return this.#region;
		}
		"".split()
		this.#region = (
			this.awsOpt.region ??
			this.url.hostname.split('.', 2)[1]
		);
		return this.#region;
	}

	/**
	 * @returns {URL}
	 */
	get url() {
		if (this.#url) {
			return this.#url;
		}
		this.#url = new URL(this.input);
		return this.#url;
	}

	/**
	 * @returns {string}
	 */
	get body() {
		if (this.#body) {
			return this.#body;
		}
		this.#body = this.init?.body ?? "";
		return this.#body;
	}

	/**
	 * @returns {Headers}
	 */
	get initHeaders() {
		if (this.#initHeaders) {
			return this.#initHeaders;
		}
		this.#initHeaders = new Headers(this.init?.headers ?? {});
		return this.#initHeaders;
	}

	/**
	 * @returns {{ [key: string]: string }}
	 */
	get headersToSign() {
		if (this.#headersToSign) {
			return this.#headersToSign;
		}
		const headers = {
			...Object.fromEntries(this.initHeaders.entries()),
			"host": this.url.hostname,
			"x-amz-date": this.timestamp,
		};
		this.#headersToSign = Object.fromEntries(
			Object
				.entries(headers)
				.filter(([k, _]) => {
					return !this.ignoreHeaders.includes(k);
				})
				.map(([k, v]) => [k, v.toString()])
		);
		return this.#headersToSign;
	}

	/**
	 * @returns {[string, string][]}
	 */
	get canonicalHeadersEntries() {
		if (this.#canonicalHeadersEntries) {
			return this.#canonicalHeadersEntries;
		}
		this.#canonicalHeadersEntries = Object
			.entries(this.headersToSign)
			.map(([key, value]) => {
				const k = key.trim().toLowerCase();
				const v = value
					.trim()
					.replace(/ +/g, " ")
					.replace(/(\r?\n)+/g, " ");
				return [k, v];
			})
			.toSorted(([left, _], [right, __]) => {
				return (
					left < right ? -1 :
					left > right ? 1 : 0
				);
			});
		return this.#canonicalHeadersEntries;
	}

	/**
	 * @returns {string}
	 */
	get datestamp() {
		if (this.#datestamp) {
			return this.#datestamp;
		}
		this.#datestamp = [
			this.date.getUTCFullYear().toString().padStart(4, "0"),
			(this.date.getUTCMonth() + 1).toString().padStart(2, "0"),
			this.date.getUTCDate().toString().padStart(2, "0"),
		].join("");
		return this.#datestamp;
	}

	/**
	 * @returns {string}
	 */
	get timestamp() {
		if (this.#timestamp) {
			return this.#timestamp;
		}
		this.#timestamp = [
			this.datestamp,
			"T",
			this.date.getUTCHours().toString().padStart(2, "0"),
			this.date.getUTCMinutes().toString().padStart(2, "0"),
			this.date.getUTCSeconds().toString().padStart(2, "0"),
			"Z",
		].join("");
		return this.#timestamp;
	}

}

/**
 * @param {string} input
 * @param {{
 *     accessKeyId: string,
 *     secretAccessKey: string,
 *     service: string,
 *     region: string,
 *     date?: Date,
 *     ignoreHeaders?: string[],
 * }} awsOpt
 * @param {RequestInit} init
 * @returns {Promise<Response>}
 */
export function fetchAws(input, awsOpt, init) {
	const aws = new AwsFetcher(input, awsOpt, init);
	return aws.fetch();
}

/**
 * @param {string} uri
 * @param {boolean} isPath
 * @returns {string}
 */
function uriEncode(uri, isPath=true) {
	const encoded = encodeURIComponent(uri)
		.replace(
			/[!'()*]/g,
			(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
		);
	return isPath ? encoded.replace(/%2F/g, "/") : encoded;
}

/**
 * @param {ArrayBuffer} keyData
 * @param {string} message
 * @returns {Promise<ArrayBuffer>}
 */
async function sign(keyData, message) {
	const algorithm = { name: "HMAC", hash: "SHA-256" };
	const key = await crypto.subtle.importKey(
		"raw",
		keyData,
		algorithm,
		false,
		["sign"],
	);
	return crypto.subtle.sign(
		algorithm.name,
		key,
		new TextEncoder("utf-8").encode(message),
	);
}

/**
 * @param {string} message
 * @returns {Promise<ArrayBuffer>}
 */
function digest(message) {
	return crypto.subtle.digest(
		"SHA-256",
		new TextEncoder("utf-8").encode(message),
	);
}

/**
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
function buffer2hex(buffer) {
	const array = [...new Uint8Array(buffer)];
	return array.map(b => b.toString(16).padStart(2, "0")).join("");
}
