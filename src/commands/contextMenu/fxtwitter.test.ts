// Mock findTwitterURLs
const mockFindTwitterUrls = jest.fn();
jest.mock('../../helpers/findTwitterUrls', () => ({
	findTwitterUrls: mockFindTwitterUrls,
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
		mockFindTwitterUrls.mockReturnValue([]);
	});

	test('complains at the caller if there are no proper Twitter links', async () => {
		mockFindTwitterUrls.mockReturnValue([]);
		await expect(fxtwitter.execute(context)).rejects.toThrow();
	});

	test.each`
		urls                                                                                 | result
		${[new URL('https://twitter.com/example')]}                                          | ${'https://fxtwitter.com/example'}
		${[new URL('https://twitter.com/example2')]}                                         | ${'https://fxtwitter.com/example2'}
		${[new URL('https://twitter.com/example'), new URL('https://twitter.com/example2')]} | ${'https://fxtwitter.com/example\nhttps://fxtwitter.com/example2'}
	`(
		'sends an ephemeral message containing fixed versions of the Twitter links returned by findTwitterUrls',
		async ({ urls, result }: { urls: string; result: string }) => {
			mockFindTwitterUrls.mockReturnValue(urls);

			await expect(fxtwitter.execute(context)).resolves.toBeUndefined();
			expect(mockReplyPrivately).toHaveBeenCalledOnce();
			expect(mockReplyPrivately).toHaveBeenCalledWith(expect.stringContaining(result));
		}
	);
});
