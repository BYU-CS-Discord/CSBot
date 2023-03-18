import type { Message } from "discord.js";
import { onEvent } from "../helpers/onEvent";

/**
 * The event handler for new messages.
 */
export const messageCreate = onEvent('messageCreate', {
	once: false,
	async execute(message: Message) {
		}
	}
});
