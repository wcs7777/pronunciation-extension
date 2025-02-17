# How2Say
## Firefox extension

[How2Say](https://addons.mozilla.org/en-US/firefox/addon/How2Say/) is a Firefox extension to help in know how to pronouce a word showing its IPA and playing its audio.  
Formerly [How2Pronounce](https://addons.mozilla.org/en-US/firefox/addon/how2pronounce/), but I lost the access to the account.  

- Select a word or text
- Right click to open the context menu and click the extension item
- Or, in Firefox Android, click the extension menu, them the addon icon
- ✨ Magic ✨

## Features

- Show word IPA
- Play audio pronunciation
- Allow to provide custom IPA and audio through the options page
- Works for texts
- Allow enable/disable IPA/audio for words and/or texts

### Configuration
The addon experience can be customized through the options page.  
IPA and audios source order can be configured dragging the sources to change the priority, and enable/disable them.  
By now, the addon supports these API's, which all of them offer a free limit per month, only requiring to sign their site to get the key/token and provide in the options page, which will be stored only in your device. They are:  
- [ResponsiveVoice](https://app.responsivevoice.org/login) (the only with a key by default)
- [Unreal Speech](https://unrealspeech.com/)
More audio sources API's are in the roadmap.

Install here [How2Say](https://addons.mozilla.org/en-US/firefox/addon/How2Say/)   

### For developers
Source code can be found [here](https://github.com/wcs7777/pronunciation-extension)  
The files in `./src/bundle/*.js` were generated with `npx rollup --config --bundleConfigAsCjs rollup.config.js` due module usage.  
It was used fflate to decompress the gzip IPA file in the installation. The script was downloaded from here [https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js](https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js) and is in `./src/utils/fflate.js`.  
It was used SortedJS in the options page. The script was downloaded from here [https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.6/Sortable.min.js](https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.6/Sortable.min.js) and is in `./src/utils/Sortable.min.js`.  

### Notes
Fallback audios are fetched from [responsivevoice.org](https://responsivevoice.org), according to their non-commercial and non-profit [rules](https://responsivevoice.org/pricing/?utm_campaign=rvorg_link&utm_source=responsivevoice-org&utm_term=menu).  
