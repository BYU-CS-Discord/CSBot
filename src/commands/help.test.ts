import type { EmbedBuilder } from 'discord.js';
import { help } from './help';

const { allCommands: realAllCommands } = jest.requireActual<typeof import('./index')>('./index');
const mockAllCommands = new Map<string, Command>();

jest.mock('./index', () => ({
	allCommands: mockAllCommands,
}));

describe('help', () => {
	const mockReply = jest.fn();
	let context: CommandContext;

	beforeEach(() => {
		mockAllCommands.clear();
		realAllCommands.forEach((value, key) => mockAllCommands.set(key, value));

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
		expect(embed.data.fields).toBeArrayOfSize(mockAllCommands.size);
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
		expect(embed.data.fields).toBeArrayOfSize(mockAllCommands.size);
		expect(embed.data).toMatchSnapshot();
	});

	test("doesn't show a guild-only command when in DMs", async () => {
		const cmd: GuildedCommand = {
			name: 'canttouchthis-do-do-do-do', // this test will break if we ever have a command with this name
			description: "Can't touch this. (This is a test.)",
			requiresGuild: true,
			dmPermission: false,
			execute() {
				// nop
			},
		};
		mockAllCommands.set(cmd.name, cmd);

		await expect(help.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			embeds: [expect.toBeObject()],
			ephemeral: true,
		});
		const call = mockReply.mock.calls[0] as [{ embeds: [EmbedBuilder] }];
		const embed = call[0].embeds[0];
		expect(embed.data.fields).toBeArrayOfSize(mockAllCommands.size - 1);
	});
});
