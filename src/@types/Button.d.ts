import type { ButtonBuilder } from 'discord.js';

declare global {
	interface Button {
		customId: string;
		execute: (context: ButtonContext) => void | Promise<void>;
		makeBuilder: () => ButtonBuilder;
	}
}
