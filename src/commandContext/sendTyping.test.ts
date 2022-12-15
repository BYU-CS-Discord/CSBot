import type { RepliableInteraction } from 'discord.js';

// Mock the logger so nothing is printed
jest.mock('../logger');

import { sendTypingFactory as factory } from './sendTyping';

describe('typing indicator', () => {
	const mockSendTyping = jest.fn();

	const interaction = {
		channel: {
			sendTyping: mockSendTyping,
		},
	} as unknown as RepliableInteraction;

	const sendTyping = factory(interaction);

	test('sends typing indicator', () => {
		expect(sendTyping()).toBeUndefined();
		expect(mockSendTyping).toHaveBeenCalledOnce();
	});
});
