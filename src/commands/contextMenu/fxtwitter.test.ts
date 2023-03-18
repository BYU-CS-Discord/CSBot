// Mock findTwitterURLs
const mockFindTwitterURLs = jest.fn();
jest.mock('../../helpers/findTwitterURLs', () => ({
	findTwitterURLs: mockFindTwitterURLs,
}));

import { fxtwitter } from './fxtwitter';

describe('Fix Twitter Links', () => {
	const mockReplyPrivately = jest.fn();
	let context: MessageContextMenuCommandContext;

	beforeEach(() => {
		context = {
			targetMessage: {
				content: '',
			},
			replyPrivately: mockReplyPrivately,
		} as unknown as MessageContextMenuCommandContext;
		mockFindTwitterURLs.mockReturnValue([]);
	});

	test('complains at the caller if there are no proper Twitter links', async () => {
		mockFindTwitterURLs.mockReturnValue([]);
		await expect(fxtwitter.execute(context)).rejects.toThrow();
	});

	test.each`
		urls                                        | result
		${[new URL('https://twitter.com/example')]} | ${'https://fxtwitter.com/example'}
	`(
		'sends an ephemeral message containing fixed versions of the Twitter links returned by findTwitterURLs',
		async ({ urls, result }: { urls: string; result: string }) => {
			mockFindTwitterURLs.mockReturnValue(urls);

			await expect(fxtwitter.execute(context)).resolves.toBeUndefined();
			expect(mockReplyPrivately).toHaveBeenCalledOnce();
			expect(mockReplyPrivately).toHaveBeenCalledWith(expect.stringContaining(result));
		}
	);
});
