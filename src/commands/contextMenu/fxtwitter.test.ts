import { beforeEach, describe, expect, test, vi } from 'vitest';

import { fxtwitter } from './fxtwitter.js';

describe('Fix Twitter Links', () => {
	const mockReplyPrivately = vi.fn<MessageContextMenuCommandContext['replyPrivately']>();
	let context: MessageContextMenuCommandContext;

	beforeEach(() => {
		context = {
			targetMessage: {
				content: '',
			},
			replyPrivately: mockReplyPrivately,
		} as unknown as MessageContextMenuCommandContext;

		mockReplyPrivately.mockClear();
	});

	test.each`
		content
		${''}
		${'example.com'}
		${'twitter.com'}
		${'fxtwitter.com'}
		${'x.com'}
		${'fixupx.com'}
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
		${'https://fixupx.com/example'}
		${'https://example.com'}
	`(
		'complains at the caller if none of the links in the message are Twitter/X links',
		async ({ content }: { content: string }) => {
			context.targetMessage.content = content;

			await expect(fxtwitter.execute(context)).rejects.toThrow();
		}
	);

	test.each`
		content                          | result
		${'https://twitter.com/example'} | ${'https://fxtwitter.com/example'}
		${'https://x.com/example'}       | ${'https://fixupx.com/example'}
	`(
		'sends an ephemeral message containing fixed versions of the Twitter/X links in the target',
		async ({ content, result }: { content: string; result: string }) => {
			context.targetMessage.content = content;

			await fxtwitter.execute(context);
			expect(mockReplyPrivately).toHaveBeenCalledOnce();
			expect(mockReplyPrivately).toHaveBeenCalledWith(expect.stringContaining(result));
		}
	);
});
