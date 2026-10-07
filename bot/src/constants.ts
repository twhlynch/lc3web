export const Colors = {
	Blurple: 0x5865f2,
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
