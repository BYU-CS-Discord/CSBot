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
	});

	test.each`
		content
		${''}
		${'example.com'}
		${'twitter.com'}
		${'fxtwitter.com'}
		${'foo/bar'}
		${'file://foo/bar'}
	`(
		'complains at the caller if there are no proper links',
		async ({ content }: { content: string }) => {
			context.targetMessage.content = content;

			await expect(fxtwitter.execute(context)).rejects.toThrow();
		}
	);

	test.each`
		content
		${'https://fxtwitter.com/example'}
		${'https://example.com'}
	`(
		'complains at the caller if none of the links in the message are Twitter links',
		async ({ content }: { content: string }) => {
			context.targetMessage.content = content;

			await expect(fxtwitter.execute(context)).rejects.toThrow();
		}
	);

	test.each`
		content                          | result
		${'https://twitter.com/example'} | ${'https://fxtwitter.com/example'}
	`(
		'sends an ephemeral message containing fixed versions of the Twitter links in the target',
		async ({ content, result }: { content: string; result: string }) => {
			context.targetMessage.content = content;

			await expect(fxtwitter.execute(context)).resolves.toBeUndefined();
			expect(mockReplyPrivately).toHaveBeenCalledOnce();
			expect(mockReplyPrivately).toHaveBeenCalledWith(expect.stringContaining(result));
		}
	);
});
