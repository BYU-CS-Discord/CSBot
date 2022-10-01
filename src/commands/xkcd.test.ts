import { xkcd } from './xkcd';

describe('xkcd', () => {
	const mockReply = jest.fn();
	const mockSendTyping = jest.fn();
	let context: CommandContext;

	beforeEach(() => {
		context = {
			reply: mockReply,
			sendTyping: mockSendTyping,
		} as unknown as CommandContext;
	});

	test('Returns an ephemeral error message when the number is out of bounds', async () => {
		context = { ...context, options: [{ value: -1 }] } as unknown as CommandContext;
		await expect(xkcd.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			content: 'Please insert a valid comic number. The range is 1-2679.',
			ephemeral: true,
		});

		context = { ...context, options: [{ value: 0 }] } as unknown as CommandContext;

		await expect(xkcd.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledTimes(2);
		expect(mockReply).toHaveBeenCalledWith({
			content: 'Please insert a valid comic number. The range is 1-2679.',
			ephemeral: true,
		});
	});

	test('Returning an embed with the latest comic when no number is given', async () => {
		context = { ...context, options: [] } as unknown as CommandContext;
		await expect(xkcd.execute(context)).resolves.toBeUndefined();
		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith({
			embeds: [expect.toBeObject()],
			ephemeral: false,
		});
	});
});
