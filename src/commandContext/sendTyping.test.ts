import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { RepliableInteraction } from 'discord.js';
import { ChannelType } from 'discord.js';

// Mock the logger so nothing is printed
vi.mock('../logger.js');

import { sendTypingFactory as factory } from './sendTyping.js';

describe('typing indicator', () => {
	const mockSendTyping = vi.fn<NonNullable<RepliableInteraction['channel']>['sendTyping']>();
	let interaction: RepliableInteraction;
	let sendTyping: () => void;

	beforeEach(() => {
		mockSendTyping.mockClear();
		interaction = {
			channel: {
				sendTyping: mockSendTyping,
				type: ChannelType.GuildText,
			},
		} as unknown as RepliableInteraction;
		sendTyping = factory(interaction);
	});

	test('sends typing indicator', () => {
		sendTyping();
		expect(mockSendTyping).toHaveBeenCalledOnce();
	});
});
