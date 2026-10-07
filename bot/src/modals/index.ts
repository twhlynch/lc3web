import type { APIInteractionResponse, APIModalSubmitInteraction } from 'discord-api-types/v10';
import { Responses } from '../constants';
import { ephemeral } from '../responses';

type ModalHandler = (
	interaction: APIModalSubmitInteraction,
	env: Env,
	ctx: ExecutionContext,
) => APIInteractionResponse | Promise<APIInteractionResponse>;

const modals: Partial<Record<string, ModalHandler>> = {};

export async function handleModalSubmit(interaction: APIModalSubmitInteraction, env: Env, ctx: ExecutionContext): Promise<Response> {
	const handler = modals[interaction.data.custom_id];

	if (handler) return Response.json(await handler(interaction, env, ctx));

	return Response.json(ephemeral(Responses.NotImplemented));
}
