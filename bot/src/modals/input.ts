import type { APIInteractionResponse, APIModalSubmitInteraction } from 'discord-api-types/v10';
import { Code, Limits } from '../constants';
import { modalTextInputValue } from '../helper';
import { runLC3 } from '../lc3';
import { ephemeral, reply } from '../responses';

export const input = (interaction: APIModalSubmitInteraction, _env: Env, _ctx: ExecutionContext): APIInteractionResponse => {
	const description = interaction.message?.embeds[0]?.description;
	if (!description?.startsWith(Code.Prefix) || !description.endsWith(Code.Suffix)) {
		return ephemeral('Source code could not be found in this message.');
	}

	try {
		const code = description.slice(Code.Prefix.length, -Code.Suffix.length);
		const programInput = modalTextInputValue(interaction, 'input');

		const output = runLC3(code, programInput)
			.replaceAll(Code.Fence, '`\u200b`\u200b`')
			.slice(0, Limits.DiscordMessageMax - Code.Prefix.length - Code.Suffix.length);

		return reply(`${Code.Prefix}${output}${Code.Suffix}`);
	} catch (error) {
		return ephemeral((error instanceof Error ? error.message : 'Unable to run source code.').slice(0, Limits.DiscordMessageMax));
	}
};
