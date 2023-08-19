import type { RepliableInteraction } from 'discord.js';
import type { Mock } from 'vitest';
import { ChannelType } from 'discord.js';

// Mock the logger so nothing is printed
vi.mock('../logger');

import { sendTypingFactory as factory } from './sendTyping';

describe('typing indicator', () => {
	let mockSendTyping: Mock<[], void>;
	let interaction: RepliableInteraction;
	let sendTyping: () => void;

	beforeEach(() => {
		mockSendTyping = vi.fn<[], undefined>();
		interaction = {
			channel: {
				sendTyping: mockSendTyping,
				type: ChannelType.GuildText,
			},
		} as unknown as RepliableInteraction;
		sendTyping = factory(interaction);
	});

	test('sends typing indicator', () => {
		expect(sendTyping()).toBeUndefined();
		expect(mockSendTyping).toHaveBeenCalledOnce();
	});

	test('does not send typing indicator in stage channels', () => {
		interaction = {
			...interaction,
			channel: { ...interaction.channel, type: ChannelType.GuildStageVoice },
		} as unknown as RepliableInteraction;
		sendTyping = factory(interaction);
		expect(sendTyping()).toBeUndefined();
		expect(mockSendTyping).not.toHaveBeenCalled();
	});
});
