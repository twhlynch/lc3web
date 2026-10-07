import assemble from '@lc3/sim/lc3_as.js';
import type { APIInteractionResponse, APIModalSubmitInteraction } from 'discord-api-types/v10';
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import { Code, Colors, Limits } from '../constants';
import { modalTextInputValue } from '../helper';
import { ephemeral, reply } from '../responses';

export const source = (interaction: APIModalSubmitInteraction, _env: Env, _ctx: ExecutionContext): APIInteractionResponse => {
	const code = modalTextInputValue(interaction, 'code');

	const result = assemble(code);
	if (result.error) return ephemeral(result.error.join('\n').slice(0, Limits.DiscordMessageMax));

	return reply('', {
		embeds: [
			{
				title: 'LC3 Source Code',
				description: `${Code.Prefix}${code}${Code.Suffix}`,
				color: Colors.Blurple,
			},
		],
		components: [
			{
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						custom_id: 'run_code',
						label: 'Run',
						style: ButtonStyle.Primary,
					},
				],
			},
		],
	});
};
