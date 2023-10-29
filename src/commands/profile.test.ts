import type { GuildMember, ImageURLOptions, User, UserResolvable } from 'discord.js';
import { DiscordAPIError, EmbedBuilder, userMention } from 'discord.js';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DiscordErrorCode } from '../helpers/DiscordErrorCode';
import { profile } from './profile';

vi.mock('../logger');

describe('profile', () => {
	const mockReply = vi.fn<[content: unknown], Promise<void>>();
	const mockReplyPrivately = vi.fn<[content: string], Promise<void>>();
	const mockGetUser = vi.fn<[name: string, required?: boolean | undefined], User | null>();
	const mockGuildMembersFetch = vi.fn<[options: UserResolvable], Promise<GuildMember>>();
	const mockAvatarURL = vi.fn<[options?: ImageURLOptions | undefined], string | null>();

	const testAvatar = 'https://example.com/avatars/1234567890/abcdef1234567890.png';
	let context: unknown;
	let user: User;
	let otherUser: User;
	let botUser: User;

	beforeEach(() => {
		user = {
			username: 'BobJoe',
			id: '1234567890',
			avatarURL: mockAvatarURL,
		} as unknown as User;

		otherUser = {
			username: 'JoeBob',
			id: '1234567891',
			avatarURL: mockAvatarURL,
		} as unknown as User;

		botUser = {
			username: 'BotBot',
			id: '1234567892',
			avatarURL: mockAvatarURL,
		} as unknown as User;

		context = {
			client: {
				user: botUser,
			},
			user,
			options: {
				getUser: mockGetUser,
			},
			reply: mockReply,
			replyPrivately: mockReplyPrivately,
			guild: {
				members: {
					fetch: mockGuildMembersFetch,
				},
			},
			source: 'guild',
		};

		mockGetUser.mockReturnValue(otherUser);
		mockAvatarURL.mockReturnValue(testAvatar);
		mockGuildMembersFetch.mockResolvedValue(otherUser as unknown as GuildMember);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	test('Throws an error when we fail to fetch the target member for an API reason', async () => {
		mockGuildMembersFetch.mockRejectedValue(
			new DiscordAPIError(
				{
					code: DiscordErrorCode.AGE_RESTRICTED,
					error: 'Under minimum age',
					message: 'Under minimum age',
				},
				DiscordErrorCode.AGE_RESTRICTED,
				404,
				'POST',
				'https://example.com',
				{}
			)
		);

		await expect(profile.execute(context)).rejects.toThrow();
		// 'An unhandled API error happened.'
	});

	test('Throws an error when we fail to fetch the target member for a stupid reason', async () => {
		mockGuildMembersFetch.mockRejectedValue(new Error('Not a DiscordAPIError instance.'));

		await expect(profile.execute(context)).rejects.toThrow();
		// 'Something went wrong.'
	});

	test('Throws an error when the target user has no profile picture', async () => {
		mockAvatarURL.mockReturnValue(null);

		await expect(profile.execute(context)).rejects.toThrow();
		// expect.stringContaining("doesn't seem to have an avatar") as string
	});

	test('Throws an error when the target user is not in the current guild', async () => {
		mockGuildMembersFetch.mockRejectedValue(
			new DiscordAPIError(
				{
					code: DiscordErrorCode.UNKNOWN_MEMBER,
					error: 'Unknown Member',
					message: 'Unknown Member',
				},
				DiscordErrorCode.UNKNOWN_MEMBER,
				404,
				'POST',
				'https://example.com',
				{}
			)
		);

		await expect(profile.execute(context)).rejects.toThrow();
		// "That user isn't here!"
	});

	test("Throws an error when trying to get another user's profile picture in DMs", async () => {
		context = { ...(context as object), guild: null, source: 'dm' };

		await expect(profile.execute(context)).rejects.toThrow();
		// "That user isn't here!"
	});

	test("Returns the url of the supplied user's profile picture", async () => {
		await expect(profile.execute(context)).resolves.toBeUndefined();
		expect(mockReplyPrivately).not.toHaveBeenCalled();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			content: `${userMention(otherUser.id)}'s profile:`,
			embeds: [
				new EmbedBuilder({
					title: otherUser.username,
					image: { url: testAvatar },
				}),
			],
		});
	});

	test.each([
		// DMs | param given
		[true, false],
		[true, true],
		[false, false],
		[false, true],
	])(
		"Returns the url of the caller's profile picture (in DMs: %p, explicitly: %p)",
		async (inDMs, explicitly) => {
			if (inDMs) {
				context = { ...(context as object), guild: null, source: 'dm' };
			}
			if (explicitly) {
				mockGetUser.mockReturnValue(user); // param was given
			} else {
				mockGetUser.mockReturnValue(null); // param was not given
			}
			mockGuildMembersFetch.mockResolvedValue(user as unknown as GuildMember);

			await expect(profile.execute(context)).resolves.toBeUndefined();
			expect(mockReplyPrivately).not.toHaveBeenCalled();
			expect(mockReply).toHaveBeenCalledOnce();
			expect(mockReply).toHaveBeenCalledWith({
				content: 'Your profile:',
				embeds: [
					new EmbedBuilder({
						title: user.username,
						image: { url: testAvatar },
					}),
				],
			});
		}
	);

	test.each([
		true, //
		false,
	])("Returns the url of the bot's profile picture (in DMs: %p)", async inDMs => {
		if (inDMs) {
			context = { ...(context as object), guild: null, source: 'dm' };
		}
		mockGetUser.mockReturnValue(botUser);
		mockGuildMembersFetch.mockResolvedValue(botUser as unknown as GuildMember);

		await expect(profile.execute(context)).resolves.toBeUndefined();
		expect(mockReplyPrivately).not.toHaveBeenCalled();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			content: 'My profile:',
			embeds: [
				new EmbedBuilder({
					title: botUser.username,
					image: { url: testAvatar },
				}),
			],
		});
	});
});
