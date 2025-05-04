/**
 * @param {string} file
 * @returns {string}
 */
function bundleName(file) {
	const fileName = file.replaceAll(
		/-+(.)/g,
		(_, p1) => p1.toUpperCase(),
	);
	return `how2say_${fileName}`;
}

const createConfig = (file) => ({
	input: `./src/content/${file}.js`,
	output: {
		file: `./src/content/bundle/${file}.js`,
		format: "iife",
		name: bundleName(file),
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
