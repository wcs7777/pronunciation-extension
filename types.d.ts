export {};

declare global {
	
	type Pronunciation = {
		ipa?: string,
		audio?: HTMLAudioElement,
	};

	type IPAFinder = (word: string, ...args: any) => Promise<string>;
	type AudioFinder = (word: string, ...args: any) => Promise<string>;

	type Storage = {
		retrieve: (key: string) => any,
		add: (key: string, value: any) => void,
		remove: (key: string) => void,
		removeAll: () => void,
	};

}
