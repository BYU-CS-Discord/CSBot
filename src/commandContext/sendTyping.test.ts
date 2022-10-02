import type { CommandInteraction } from 'discord.js';

jest.mock('../logger');
import { getLogger } from '../logger';
const mockGetLogger = getLogger as jest.Mock;
const mockConsoleDebug = jest.fn();
mockGetLogger.mockImplementation(() => {
	return {
		debug: mockConsoleDebug,
	} as unknown as Console;
});

import { sendTypingFactory as factory } from './sendTyping';

describe('typing indicator', () => {
	const mockSendTyping = jest.fn();

	const interaction = {
		channel: {
			sendTyping: mockSendTyping,
		},
	} as unknown as CommandInteraction;

	const sendTyping = factory(interaction);

	test('sends typing indicator', () => {
		expect(sendTyping()).toBeUndefined();
		expect(mockSendTyping).toHaveBeenCalledOnce();
	});
});
