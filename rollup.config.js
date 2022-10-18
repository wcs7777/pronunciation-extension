export default [
	{
		input: "src/content/show-ipa.injection.js",
		output: {
			file: "src/content/bundle/show-ipa.injection.js",
			format: "iife",
		},
	},
	{
		input: "src/content/cambridge.js",
		output: {
			file: "src/content/bundle/cambridge.js",
			format: "iife",
		},
	},
	{
		input: "src/content/howjsay.js",
		output: {
			file: "src/content/bundle/howjsay.js",
			format: "iife",
		},
	},
	{
		input: "src/content/tophonetics.js",
		output: {
			file: "src/content/bundle/tophonetics.js",
			format: "iife",
		},
	},
	{
		input: "src/content/linguee.js",
		output: {
			file: "src/content/bundle/linguee.js",
			format: "iife",
		},
	},
	{
		input: "src/content/oxford.js",
		output: {
			file: "src/content/bundle/oxford.js",
			format: "iife",
		},
	},
];

// https://rollupjs.org/guide/en/#configuration-files
// npx rollup --config --bundleConfigAsCjs rollup.config.js
