# How2Say
## Firefox extension

[How2Say](https://addons.mozilla.org/en-US/firefox/addon/How2Say/) is a Firefox extension to help in know how to pronouce a word showing its IPA and playing its audio.
Old [How2Pronounce](https://addons.mozilla.org/en-US/firefox/addon/how2pronounce/), but I lost the access to the account.

- Select a word or text
- Right click to open the context menu and click the extension item
- ✨Magic ✨

## Features

- Show word IPA
- Play audio pronunciation
- Allow to provide custom IPA and audio through the options page
- Works for texts until 1500 characters

Install here [How2Say](https://addons.mozilla.org/en-US/firefox/addon/How2Say/)
Obs: takes around 50 seconds to install the extension until the first usage due to the pre-defined IPA saving in local storage.

### For developers
The files in ./src/bundle/*.js were generated with `npx rollup --config --bundleConfigAsCjs rollup.config.js` due module usage.
It was used fflate to decompress the gzip IPA file in the installation. The fflate script was downloaded from here [https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js](https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js) and is in ./src/utils/fflate.js.

### Notes
Fallback audios are fetched from [responsivevoice.org](https://responsivevoice.org), according to they non-commercial and non-profit [rules](https://responsivevoice.org/pricing/?utm_campaign=rvorg_link&utm_source=responsivevoice-org&utm_term=menu).
