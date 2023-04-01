export default class Cache {
	constructor() {
		this.audios = {};
		this.ipas = {};
		this.options = {};
	}

	addIpa(word, ipa) {
		this.ipas[word] = ipa;
	}

	getIpa(word) {
		return this.ipas[word];
	}

	addAudio(word, audio) {
		this.audios[word] = audio;
	}

	getAudio(word) {
		return this.audios[word];
	}

	setOptions(options) {
		this.options = options;
	}

	getOptions(keys) {
		if (Array.isArray(keys)) {
			const options = {};
			for (const key of keys) {
				options[key] = this.options[key];
			}
			return options;
		} else if (keys) {
			return this.options[keys];
		} else {
			return this.options;
		}
	}

}

