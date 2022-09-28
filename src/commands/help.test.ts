import type { CommandContext } from '../CommandContext';
import { help } from './help';

describe('help', () => {
	test("it's just a Hello World", async () => {
		const mockReply = jest.fn();
		const context = {
			reply: mockReply,
		} as unknown as CommandContext;

		await expect(help.execute(context)).resolves.toBeUndefined();

		expect(mockReply).toHaveBeenCalledOnce();
		expect(mockReply).toHaveBeenCalledWith('Hello, world!');
	});
});
