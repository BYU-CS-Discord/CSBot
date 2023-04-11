import type { MessageReaction, User } from 'discord.js';
import { duplicate } from './duplicate';

describe('Reaction duplication', () => {
	const mockResendReact = jest.fn<Promise<unknown>, []>();

	let mockRandom: jest.SpyInstance<number, []>;
	let mockReaction: MessageReaction;
	let mockSender: User;
	let mockContext: ReactionHandlerContext;

	beforeEach(() => {
		mockRandom = jest.spyOn(global.Math, 'random').mockReturnValue(1);

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

		mockContext = {
			reaction: mockReaction,
			user: mockSender,
		};
	});

	afterEach(() => {
		mockRandom.mockRestore();
	});

	test("sometimes duplicates a user's react", async () => {
		await expect(duplicate.execute(mockContext)).resolves.toBeUndefined();
		expect(mockResendReact).toHaveBeenCalledOnce();
	});

	test("sometimes ignores a user's react", async () => {
		mockRandom.mockReturnValue(0.5);
		await expect(duplicate.execute(mockContext)).resolves.toBeUndefined();
		expect(mockResendReact).not.toHaveBeenCalled();
	});

	test('ignores :star:', async () => {
		mockReaction.emoji.name = '⭐';
		await expect(duplicate.execute(mockContext)).resolves.toBeUndefined();
		expect(mockResendReact).not.toHaveBeenCalled();
	});
});
