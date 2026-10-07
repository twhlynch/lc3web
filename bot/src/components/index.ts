import type { APIInteractionResponse, APIMessageComponentInteraction } from 'discord-api-types/v10';
import { Responses } from '../constants';
import { ephemeral } from '../responses';
import { run } from './run';

type ComponentHandler = (
	interaction: APIMessageComponentInteraction,
	env: Env,
	ctx: ExecutionContext,
) => APIInteractionResponse | Promise<APIInteractionResponse>;

const components: Partial<Record<string, ComponentHandler>> = {
	run_code: run,
};

export async function handleMessageComponent(
	interaction: APIMessageComponentInteraction,
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	const handler = components[interaction.data.custom_id];
	if (handler) return Response.json(await handler(interaction, env, ctx));
	return Response.json(ephemeral(Responses.NotImplemented));
}
