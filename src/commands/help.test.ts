import type { EmbedBuilder } from 'discord.js';
import { help } from './help';

describe('help', () => {
	const mockReply = jest.fn();
	let context: CommandContext;

	beforeEach(() => {
		context = {
			guild: null,
			reply: mockReply,
		} as unknown as CommandContext;
	});

	test('presents an ephemeral embed with all available global commands', async () => {
		context = { ...context, guild: null };

		await expect(help.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			embeds: [expect.toBeObject()],
			ephemeral: true,
		});
		const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data).toMatchSnapshot();
	});

	test('presents an ephemeral embed with all available global and guild-bound commands', async () => {
		context = {
			...context,
			guild: { id: 'the-guild-1234' },
		} as unknown as CommandContext;

		await expect(help.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			embeds: [expect.toBeObject()],
			ephemeral: true,
		});
		const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data).toMatchSnapshot();
	});
});
