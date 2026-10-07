const GUILD_COMMAND = { integration_types: [0], contexts: [0] };
const STRING_OPTION = { type: 3 };
const USER_OPTION = { type: 6 };
const CHANNEL_OPTION = { type: 7 };
const ROLE_OPTION = { type: 8 };

export const commands = [
	{
		name: "run",
		description: "Runs an lc3 script",
		...GUILD_COMMAND,
	},
];
