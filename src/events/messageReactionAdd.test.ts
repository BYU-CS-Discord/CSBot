import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { MessageReaction, User } from 'discord.js';

import { messageReactionAdd } from './messageReactionAdd.js';

vi.mock('../logger.js');

describe('Reaction duplication', () => {
	const mockResendReact = vi.fn<MessageReaction['react']>();

	let mockRandom: MockInstance<typeof Math.random>;
	let mockReaction: MessageReaction;
	let mockSender: User;

	beforeEach(() => {
		mockRandom = vi.spyOn(globalThis.Math, 'random').mockReturnValue(1);

		mockReaction = {
			me: false,
			client: {
				user: {
					id: 'itz-meeee',
				},
			},
			message: {
				author: {
					id: 'other-user',
				},
			},
			emoji: {
				name: 'blue_square',
			},
			count: 1,
			react: mockResendReact,
		} as unknown as MessageReaction;

		mockSender = {
			bot: false,
		} as unknown as User;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	test("sometimes duplicates a user's react", async () => {
		await messageReactionAdd.execute(mockReaction, mockSender);
		expect(mockResendReact).toHaveBeenCalledOnce();
	});

	test("sometimes ignores a user's react", async () => {
		mockRandom.mockReturnValue(0.5);
		await messageReactionAdd.execute(mockReaction, mockSender);
		expect(mockResendReact).not.toHaveBeenCalled();
	});

	test('ignores emoji with an empty name', async () => {
		mockReaction.emoji.name = '';
		await messageReactionAdd.execute(mockReaction, mockSender);
		expect(mockResendReact).not.toHaveBeenCalled();
	});

	test('ignores emoji with a null name', async () => {
		mockReaction.emoji.name = null;
		await messageReactionAdd.execute(mockReaction, mockSender);
		expect(mockResendReact).not.toHaveBeenCalled();
	});

	test('ignores bot reacts', async () => {
		mockSender.bot = true;
		await messageReactionAdd.execute(mockReaction, mockSender);
		expect(mockResendReact).not.toHaveBeenCalled();
	});

	test("ignores the bot's own reacts", async () => {
		mockReaction.me = true;
		await messageReactionAdd.execute(mockReaction, mockSender);
		expect(mockResendReact).not.toHaveBeenCalled();
	});

	test('ignores :star:', async () => {
		mockReaction.emoji.name = '⭐';
		await messageReactionAdd.execute(mockReaction, mockSender);
		expect(mockResendReact).not.toHaveBeenCalled();
	});
});
