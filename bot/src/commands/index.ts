import type { APIChatInputApplicationCommandInteraction, APIInteractionResponse } from 'discord-api-types/v10';
import { Responses } from '../constants';
import { ephemeral } from '../responses';

type CommandHandler = (
	interaction: APIChatInputApplicationCommandInteraction,
	env: Env,
	ctx: ExecutionContext,
) => APIInteractionResponse | Promise<APIInteractionResponse>;

const slash_commands: Partial<Record<string, CommandHandler>> = {};

export async function handleApplicationCommand(
	interaction: APIChatInputApplicationCommandInteraction,
	env: Env,
	ctx: ExecutionContext,
): Promise<Response> {
	const handler = slash_commands[interaction.data.name];

	if (handler) return Response.json(await handler(interaction, env, ctx));

	return Response.json(ephemeral(Responses.NotImplemented));
}
