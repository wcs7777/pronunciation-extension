# How2Say
## Firefox extension

<p align="center">
  <img src="https://github.com/user-attachments/assets/5458ba78-f2f7-47e1-9185-db1b6166da95" width="250" />
</p>

[How2Say](https://addons.mozilla.org/en-US/firefox/addon/How2Say/) is a Firefox extension to help you to know how to pronounce a word showing its IPA and playing its audio.  
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
- Allow control audio with a player for texts (enable/disable through options)  
- Allow control audio with shortcuts for texts (enable/disable through options)  
- Highly customizable through the options [page](about:addons)  

### Configuration
The addon experience can be customized through the options page.  
IPA and audios source order can be configured dragging the sources to change the priority, and enable/disable them.  
By now, the addon supports these API's, which all of them offer a free limit per month, only requiring to sign their site to get the key/token and provide in the options page, which will be stored only in your device. They are:  
- [ResponsiveVoice](https://app.responsivevoice.org/login) (the only with a key by default)  
- [Unreal Speech](https://unrealspeech.com/)  
- [Speechify](https://console.sws.speechify.com/login)  
- [PlayHT](https://play.ht/signup/?attribution=%2F)  
- [ElevenLabs](https://elevenlabs.io/app/sign-up)  
- [AmazonPolly](https://aws.amazon.com/polly/) (1 year of free tier)  
- [OpenAI](https://platform.openai.com/docs/overview) (there is no free tier)  

More audio sources API's are in the roadmap.  

Install here [How2Say](https://addons.mozilla.org/en-US/firefox/addon/How2Say/)   

### For developers
Source code can be found [here](https://github.com/wcs7777/pronunciation-extension)  
The files in `./src/bundle/*.js` were generated with `npx rollup --config --bundleConfigAsCjs rollup.config.js` due module usage.  
It was used fflate to decompress the gzip IPA file in the installation. The script was downloaded from here [https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js](https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js) and is in `./src/utils/fflate.js`.  
It was used SortedJS in the options page. The script was downloaded from here [https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.6/Sortable.min.js](https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.6/Sortable.min.js) and is in `./src/utils/Sortable.min.js`.  
