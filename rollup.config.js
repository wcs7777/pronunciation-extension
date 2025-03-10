const createConfig = (file) => ({
	input: `./src/content/${file}.js`,
	output: {
		file: `./src/content/bundle/${file}.js`,
		format: "iife",
	},
});

const configs = [
	"message",
	"cambridge",
	"oxford",
].map(createConfig);

export default configs;

// https://rollupjs.org/guide/en/#configuration-files
// npx rollup --config --bundleConfigAsCjs rollup.config.js
