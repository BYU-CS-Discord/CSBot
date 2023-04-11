import type { MessageReaction, User } from 'discord.js';
import { messageReactionAdd } from './messageReactionAdd';

// eslint-disable-next-line no-var
var mockAllReactionHandlers = new Set<ReactionHandler>(); // I'm not sure why it needs a var here
jest.mock('../reactionHandlers', () => ({
	allReactionHandlers: mockAllReactionHandlers,
}));
const mockHandlerExecute = jest.fn<Promise<void>, []>();
const mockReactionHandler = {
	execute: mockHandlerExecute,
};
mockAllReactionHandlers.add(mockReactionHandler);

describe('Reaction duplication', () => {
	let mockRandom: jest.SpyInstance<number, []>;
	let mockReaction: MessageReaction;
	let mockSender: User;

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
		} as unknown as MessageReaction;

		mockSender = {
			bot: false,
		} as unknown as User;
	});

	afterEach(() => {
		mockRandom.mockRestore();
	});

	test('ignores emoji with an empty name', async () => {
		mockReaction.emoji.name = '';
		await expect(messageReactionAdd.execute(mockReaction, mockSender)).resolves.toBeUndefined();
		expect(mockHandlerExecute).not.toHaveBeenCalled();
	});

	test('ignores emoji with a null name', async () => {
		mockReaction.emoji.name = null;
		await expect(messageReactionAdd.execute(mockReaction, mockSender)).resolves.toBeUndefined();
		expect(mockHandlerExecute).not.toHaveBeenCalled();
	});

	test('ignores bot reacts', async () => {
		mockSender.bot = true;
		await expect(messageReactionAdd.execute(mockReaction, mockSender)).resolves.toBeUndefined();
		expect(mockHandlerExecute).not.toHaveBeenCalled();
	});

	test("ignores the bot's own reacts", async () => {
		mockReaction.me = true;
		await expect(messageReactionAdd.execute(mockReaction, mockSender)).resolves.toBeUndefined();
		expect(mockHandlerExecute).not.toHaveBeenCalled();
	});
});
