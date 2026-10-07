import {
	APIActionRowComponent,
	APIButtonComponentWithCustomId,
	APIEmbed,
	ComponentType,
	InteractionResponseType,
	MessageFlags,
	TextInputStyle,
} from 'discord-api-types/v10';
import type {
	APIInteractionResponse,
	APIInteractionResponseCallbackData,
	APIModalInteractionResponseCallbackComponent,
	APITextInputComponent,
} from 'discord-api-types/v10';

function discordResponse(data: Partial<APIInteractionResponseCallbackData>): APIInteractionResponse {
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: { ...data },
	};
}

export function ephemeral(content: string, ...embeds: APIEmbed[]): APIInteractionResponse {
	return discordResponse({ content, embeds, flags: MessageFlags.Ephemeral });
}

export function reply(
	content: string,
	options?: {
		embeds?: APIEmbed[];
		components: APIActionRowComponent<APIButtonComponentWithCustomId>[];
	},
): APIInteractionResponse {
	return discordResponse({ content, ...options });
}

export function modal(id: string, title: string, components: APIModalInteractionResponseCallbackComponent[]): APIInteractionResponse {
	return {
		type: InteractionResponseType.Modal,
		data: {
			custom_id: id,
			title,
			components,
		},
	};
}

export function modalTextAreaComponent(
	id: string,
	label: string,
	options?: {
		placeholder?: string;
		value?: string;
		required?: boolean;
		minLength?: number;
		maxLength?: number;
	},
): APIActionRowComponent<APITextInputComponent> {
	return {
		type: ComponentType.ActionRow,
		components: [
			{
				type: ComponentType.TextInput,
				custom_id: id,
				label,
				style: TextInputStyle.Paragraph,
				required: options?.required ?? true,
				placeholder: options?.placeholder,
				value: options?.value,
				min_length: options?.minLength,
				max_length: options?.maxLength,
			},
		],
	};
}
