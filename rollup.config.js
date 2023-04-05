const configs = createConfigs([
	"messages",
	"cambridge",
	"howjsay",
	"tophonetics",
	"linguee",
	"oxford",
]);

function createConfigs(files) {
	return files.map((file) => {
		return {
			input: `src/content/${file}.js`,
			output: {
				file: `src/content/bundle/${file}.js`,
				format: "iife",
			},
		};
	});
}

export default configs;

// https://rollupjs.org/guide/en/#configuration-files
// npx rollup --config --bundleConfigAsCjs rollup.config.js
