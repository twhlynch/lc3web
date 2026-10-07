import { Buffer } from 'node:buffer';
import { APIInteraction, InteractionResponseType } from 'discord-api-types/v10';
import nacl from 'tweetnacl';
import { handleApplicationCommand } from './commands';
import { handleMessageComponent } from './components';
import { Responses } from './constants';
import { isApplicationCommand, isMessageComponent, isModalSubmit, isPing } from './helper';
import { handleModalSubmit } from './modals';

function validate(body: string, request: Request, env: Env): boolean {
	const signature = request.headers.get('x-signature-ed25519');
	const timestamp = request.headers.get('x-signature-timestamp');
	return (
		!!signature &&
		!!timestamp &&
		nacl.sign.detached.verify(Buffer.from(timestamp + body), Buffer.from(signature, 'hex'), Buffer.from(env.PUBLIC_KEY, 'hex'))
	);
}

export default {
	async fetch(request, env, ctx): Promise<Response> {
		// Discord API only sends POST requests
		if (request.method !== 'POST') {
			return new Response(Responses.MethodNotAllowed, { status: 405 });
		}

		// Validate whether the request is from Discord
		const body = await request.text();
		const verified = validate(body, request, env);
		if (!verified) {
			return new Response(Responses.InvalidSignature, { status: 401 });
		}

		const interaction = JSON.parse(body) as APIInteraction;
		console.info(interaction);

		// Handle Ping
		if (isPing(interaction)) {
			return Response.json({ type: InteractionResponseType.Pong });
		}

		// Handle Command
		if (isApplicationCommand(interaction)) {
			return handleApplicationCommand(interaction, env, ctx);
		}

		// Handle Message Components
		if (isMessageComponent(interaction)) {
			return handleMessageComponent(interaction, env, ctx);
		}

		// Handle Modals
		if (isModalSubmit(interaction)) {
			return handleModalSubmit(interaction, env, ctx);
		}

		return new Response(Responses.InvalidRequestType, { status: 400 });
	},
} satisfies ExportedHandler<Env>;
