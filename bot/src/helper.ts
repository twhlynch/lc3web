import { ComponentType, InteractionType } from 'discord-api-types/v10';
import type {
	APIChatInputApplicationCommandInteraction,
	APIInteraction,
	APIMessageComponentInteraction,
	APIModalSubmitInteraction,
	APIPingInteraction,
} from 'discord-api-types/v10';

export function isPing(interaction: APIInteraction): interaction is APIPingInteraction {
	return interaction.type === InteractionType.Ping;
}

export function isApplicationCommand(interaction: APIInteraction): interaction is APIChatInputApplicationCommandInteraction {
	return interaction.type === InteractionType.ApplicationCommand;
}

export function isModalSubmit(interaction: APIInteraction): interaction is APIModalSubmitInteraction {
	return interaction.type === InteractionType.ModalSubmit;
}

export function isMessageComponent(interaction: APIInteraction): interaction is APIMessageComponentInteraction {
	return interaction.type === InteractionType.MessageComponent;
}

export function modalTextInputValue(interaction: APIModalSubmitInteraction, id: string): string {
	const inputs = interaction.data.components.flatMap((component) => {
		if (component.type === ComponentType.ActionRow) return component.components;
		if (component.type === ComponentType.Label && component.component.type === ComponentType.TextInput) {
			return [component.component];
		}
		return [];
	});
	return inputs.find((input) => input.custom_id === id)?.value ?? '';
}
