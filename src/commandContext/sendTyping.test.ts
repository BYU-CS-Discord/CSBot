import type { CommandInteraction } from 'discord.js';
import { sendTypingFactory as factory } from './sendTyping';

describe('typing indicator', () => {
	const mockSendTyping = jest.fn();
	const mockConsoleDebug = jest.fn();

	const mockConsole = {
		debug: mockConsoleDebug,
	} as unknown as Console;

	const interaction = {
		channel: {
			sendTyping: mockSendTyping,
		},
	} as unknown as CommandInteraction;

	const sendTyping = factory(interaction, mockConsole);

	test('sends typing indicator', () => {
		expect(sendTyping()).toBeUndefined();
		expect(mockSendTyping).toHaveBeenCalledOnce();
	});
});
