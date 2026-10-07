export const Colors = {
	Blurple: 0x5865f2,
} as const;

export const Limits = {
	DiscordMessageMax: 2000,
	DiscordTextInputMax: 4000,
} as const;

// prettier-ignore
export const Responses = {
	// Invalid things
	InvalidInteraction: 'Invalid interaction.',
	NotImplemented:     'Not implemented.',

	// HTTP responses
	MethodNotAllowed:   'Method not allowed',
	InvalidSignature:   'Invalid request signature',
	InvalidRequestType: 'Invalid request type',

	// Fallback
	SomethingWentWrong: 'Something went wrong.',
	RateLimited:        'Rate limited. Try again in ',
} as const;

const code = '```';
const lang = 'x86asm';

export const Code = {
	Fence: code,
	Prefix: `${code}${lang}\n`,
	Suffix: `\n${code}`,
} as const;
