const cache = {
	list: {},

	contains(word) {
		return (
			this.getIpa(word) !== undefined &&
			this.getAudio(word) !== undefined &&
			true
		);
	},

	setIpa(word, ipa) {
		this.list[word] = {
			...this.list[word],
			ipa,
		};
		return ipa;
	},

	setAudio(word, audio) {
		this.list[word] = {
			...this.list[word],
			audio,
		};
		return audio;
	},

	getIpa(word) {
		return this.list[word]?.ipa;
	},

	getAudio(word) {
		return this.list[word]?.audio;
	},

	empty() {
		return this.list = {};
	},

	length() {
		return Object.keys(this.list).length;
	},
};

export default cache;
