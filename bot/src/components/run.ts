import type { APIInteractionResponse, APIMessageComponentInteraction } from 'discord-api-types/v10';
import { Limits } from '../constants';
import { modal, modalTextAreaComponent } from '../responses';

export const run = (_interaction: APIMessageComponentInteraction, _env: Env, _ctx: ExecutionContext): APIInteractionResponse => {
	return modal('run_input', 'Run LC3', [
		modalTextAreaComponent('input', 'Program input (optional)', {
			required: false,
			maxLength: Limits.DiscordTextInputMax,
			placeholder: 'Enter input for GETC / IN or leave blank.',
		}),
	]);
};
