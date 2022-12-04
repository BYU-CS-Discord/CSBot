import { sendtag } from './sendtag';

describe('sendtag', () => {
	const mockReply = jest.fn<Promise<void>, [content: string]>();
	const mockGetString = jest.fn<string, [name: string, required: true]>();

	let context: GuildedCommandContext;

	beforeEach(() => {
		context = {
			reply: mockReply,
			interaction: {
				options: {
					getString: mockGetString,
				},
			},
		} as unknown as GuildedCommandContext;

		mockReply.mockResolvedValue(undefined);
		mockGetString.mockReturnValue('');
	});

	test('presents an response with the given option string', async () => {
		const value = 'lorem ipsum';
		mockGetString.mockReturnValue(value);
		await expect(sendtag.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith(`You requested the '${value}' tag!`);
	});
});
