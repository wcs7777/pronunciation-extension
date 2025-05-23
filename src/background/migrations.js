export async function migrateToV3_2_0() {
	console.log("migrating options to v3.2.0");
	const result = await browser.storage.local.get("options");
	if (!("options" in result)) {
		console.log("options not in storage");
		return;
	}
	/**
	* @type {Options}
	*/
	const options = result["options"];
	for (const source of Object.keys(options.ipa.sources)) {
		delete options.ipa.sources[source]["waitStatuses"];
	}
	for (const source of Object.keys(options.audio.sources)) {
		delete options.audio.sources[source]["waitStatuses"];
	}
	await browser.storage.local.set({ options });
}

export async function migrateToV3() {
	console.log("migrating options to v3");
	const result = await browser.storage.local.get("options");
	if (!("options" in result)) {
		console.log("options not in storage");
		return;
	}
	const old = result["options"];
	/**
	* @type {Options}
	*/
	const options = {
		accessKey: old.accessKey,
		allowText: old.allowText,
		ipa: {
			enabled: old.ipa.enabled,
			text: {
				enabled: old.ipa.enabledToText,
			},
			style: {
				font: {
					family: old.ipa.font.family,
					size: old.ipa.font.size,
					color: old.ipa.font.color,
				},
				backgroundColor: old.ipa.font.backgroundColor,
				useContextColors: old.ipa.useContextColors,
			},
			close: {
				timeout: old.ipa.close.timeout,
				shortcut: old.ipa.close.shortcut,
				onScroll: old.ipa.close.onScroll,
				buttonColor: old.ipa.close.buttonColor,
				buttonHoverColor: old.ipa.close.buttonHoverColor,
			},
			position: {
				menuTriggered: old.ipa.position.menuTriggered,
				actionTriggered: old.ipa.position.actionTriggered,
			},
			sources: {
				cambridge: {
					enabled: old.ipa.cambridge.enabled,
					order: old.ipa.cambridge.order,
					enabledToText: old.ipa.cambridge.enabledToText,
					orderToText: old.ipa.cambridge.orderToText,
					save: old.ipa.cambridge.save,
					saveError: old.ipa.cambridge.saveError,
					textMaxLength: old.ipa.cambridge.textMaxLength,
				},
				oxford: {
					enabled: old.ipa.oxford.enabled,
					order: old.ipa.oxford.order,
					enabledToText: old.ipa.oxford.enabledToText,
					orderToText: old.ipa.oxford.orderToText,
					save: old.ipa.oxford.save,
					saveError: old.ipa.oxford.saveError,
					textMaxLength: old.ipa.oxford.textMaxLength,
				},
				antvaset: {
					enabled: old.ipa.antvaset.enabled,
					order: old.ipa.antvaset.order,
					enabledToText: old.ipa.antvaset.enabledToText,
					orderToText: old.ipa.antvaset.orderToText,
					save: old.ipa.antvaset.save,
					saveError: old.ipa.antvaset.saveError,
					textMaxLength: old.ipa.antvaset.textMaxLength,
				},
				unalengua: {
					enabled: old.ipa.unalengua.enabled,
					order: old.ipa.unalengua.order,
					enabledToText: old.ipa.unalengua.enabledToText,
					orderToText: old.ipa.unalengua.orderToText,
					save: old.ipa.unalengua.save,
					saveError: old.ipa.unalengua.saveError,
					textMaxLength: old.ipa.unalengua.textMaxLength,
				},
			},
		},
		audio: {
			enabled: old.audio.enabled,
			text: {
				enabled: old.audio.enabledToText,
				save: old.audio.saveTextAudio,
				playerEnabled: old.audio.playerEnabledToText,
				shortcutsEnabled: old.audio.shortcutsEnabledToText,
				shortcuts: {
					togglePlayer: old.audio.shortcuts.togglePlayer,
					togglePlay: old.audio.shortcuts.togglePlay,
					toggleMute: old.audio.shortcuts.toggleMute,
					rewind: old.audio.shortcuts.rewind,
					previous: old.audio.shortcuts.previous,
					next: old.audio.shortcuts.next,
					backward: old.audio.shortcuts.backward,
					forward: old.audio.shortcuts.forward,
					decreaseVolume: old.audio.shortcuts.decreaseVolume,
					increaseVolume: old.audio.shortcuts.increaseVolume,
					decreaseSpeed: old.audio.shortcuts.decreaseSpeed,
					increaseSpeed: old.audio.shortcuts.increaseSpeed,
					resetSpeed: old.audio.shortcuts.resetSpeed,
				},
			},
			volume: old.audio.volume,
			playbackRate: old.audio.playbackRate,
			sources: {
				cambridge: {
					enabled: true,
					order: 1,
					enabledToText: false,
					orderToText: 0,
					save: true,
					saveError: true,
					textMaxLength: 0,
				},
				linguee: {
					enabled: true,
					order: 2,
					enabledToText: false,
					orderToText: 0,
					save: true,
					saveError: true,
					textMaxLength: 0,
				},
				oxford: {
					enabled: true,
					order: 3,
					enabledToText: false,
					orderToText: 0,
					save: true,
					saveError: true,
					textMaxLength: 0,
				},
				gstatic: {
					enabled: true,
					order: 4,
					enabledToText: false,
					orderToText: 0,
					save: true,
					saveError: true,
					textMaxLength: 0,
				},
				googleSpeech: {
					enabled: old.audio.googleSpeech.enabled,
					order: old.audio.googleSpeech.order,
					enabledToText: old.audio.googleSpeech.enabledToText,
					orderToText: old.audio.googleSpeech.orderToText,
					save: old.audio.googleSpeech.save,
					saveError: old.audio.googleSpeech.saveError,
					textMaxLength: old.audio.googleSpeech.textMaxLength,
				},
				responsiveVoice: {
					enabled: old.audio.responsiveVoice.enabled,
					order: old.audio.responsiveVoice.order,
					enabledToText: old.audio.responsiveVoice.enabledToText,
					orderToText: old.audio.responsiveVoice.orderToText,
					save: old.audio.responsiveVoice.save,
					saveError: old.audio.responsiveVoice.saveError,
					textMaxLength: old.audio.responsiveVoice.textMaxLength,
					api: {
						name: old.audio.responsiveVoice.api.name,
						key: old.audio.responsiveVoice.api.key,
						gender: old.audio.responsiveVoice.api.gender,
					},
				},
				unrealSpeech: {
					enabled: old.audio.unrealSpeech.enabled,
					order: old.audio.unrealSpeech.order,
					enabledToText: old.audio.unrealSpeech.enabledToText,
					orderToText: old.audio.unrealSpeech.orderToText,
					save: old.audio.unrealSpeech.save,
					saveError: old.audio.unrealSpeech.saveError,
					textMaxLength: old.audio.unrealSpeech.textMaxLength,
					api: {
						token: old.audio.unrealSpeech.api.token,
						voiceId: old.audio.unrealSpeech.api.voiceId,
						bitRate: old.audio.unrealSpeech.api.bitRate,
						pitch: old.audio.unrealSpeech.api.pitch,
						codec: old.audio.unrealSpeech.api.codec,
						temperature: old.audio.unrealSpeech.api.temperature,
					},
				},
				speechify: {
					enabled: old.audio.speechify.enabled,
					order: old.audio.speechify.order,
					enabledToText: old.audio.speechify.enabledToText,
					orderToText: old.audio.speechify.orderToText,
					save: old.audio.speechify.save,
					saveError: old.audio.speechify.saveError,
					textMaxLength: old.audio.speechify.textMaxLength,
					api: {
						token: old.audio.speechify.api.token,
						voiceId: old.audio.speechify.api.voiceId,
					},
				},
				playHt: {
					enabled: old.audio.playHt.enabled,
					order: old.audio.playHt.order,
					enabledToText: old.audio.playHt.enabledToText,
					orderToText: old.audio.playHt.orderToText,
					save: old.audio.playHt.save,
					saveError: old.audio.playHt.saveError,
					textMaxLength: old.audio.playHt.textMaxLength,
					api: {
						userId: old.audio.playHt.api.userId,
						key: old.audio.playHt.api.key,
						voiceId: old.audio.playHt.api.voiceId,
						quality: old.audio.playHt.api.quality,
						outputFormat: old.audio.playHt.api.outputFormat,
						sampleRate: old.audio.playHt.api.sampleRate,
						temperature: old.audio.playHt.api.temperature,
						voiceEngine: old.audio.playHt.api.voiceEngine,
					},
				},
				elevenLabs: {
					enabled: old.audio.elevenLabs.enabled,
					order: old.audio.elevenLabs.order,
					enabledToText: old.audio.elevenLabs.enabledToText,
					orderToText: old.audio.elevenLabs.orderToText,
					save: old.audio.elevenLabs.save,
					saveError: old.audio.elevenLabs.saveError,
					textMaxLength: old.audio.elevenLabs.textMaxLength,
					api: {
						key: old.audio.elevenLabs.api.key,
						voiceId: old.audio.elevenLabs.api.voiceId,
						outputFormat: old.audio.elevenLabs.api.outputFormat,
						modelId: old.audio.elevenLabs.api.modelId,
						applyTextNormalization: old.audio.elevenLabs.api.applyTextNormalization,
					},
				},
				amazonPolly: {
					enabled: old.audio.amazonPolly.enabled,
					order: old.audio.amazonPolly.order,
					enabledToText: old.audio.amazonPolly.enabledToText,
					orderToText: old.audio.amazonPolly.orderToText,
					save: old.audio.amazonPolly.save,
					saveError: old.audio.amazonPolly.saveError,
					textMaxLength: old.audio.amazonPolly.textMaxLength,
					api: {
						accessKeyId: old.audio.amazonPolly.api.accessKeyId,
						secretAccessKey: old.audio.amazonPolly.api.secretAccessKey,
						endpoint: old.audio.amazonPolly.api.endpoint,
						engine: old.audio.amazonPolly.api.engine,
						outputFormat: old.audio.amazonPolly.api.outputFormat,
						sampleRate: old.audio.amazonPolly.api.sampleRate,
						voiceId: old.audio.amazonPolly.api.voiceId,
					},
				},
				openAi: {
					enabled: old.audio.openAi.enabled,
					order: old.audio.openAi.order,
					enabledToText: old.audio.openAi.enabledToText,
					orderToText: old.audio.openAi.orderToText,
					save: old.audio.openAi.save,
					saveError: old.audio.openAi.saveError,
					textMaxLength: old.audio.openAi.textMaxLength,
					api: {
						key: old.audio.openAi.api.key,
						model: old.audio.openAi.api.model,
						voice: old.audio.openAi.api.voice,
						responseFormat: old.audio.openAi.api.responseFormat,
					},
				},
			},
		},
		setPronuncationByShortcut: {
			enabled: old.setPronuncationByShortcut.enabled,
			audioShortcut: old.setPronuncationByShortcut.audioShortcut,
			ipaShortcut: old.setPronuncationByShortcut.ipaShortcut,
			restoreDefaultIpaShortcut: old.setPronuncationByShortcut.restoreDefaultIpaShortcut,
		},
	};
	await browser.storage.local.set({ options });
}
