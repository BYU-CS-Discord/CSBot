import { findTwitterURLs } from "./findTwitterURLs";

describe('Find Twitter URLs', () => {

	test.each`
		content
		${''}
		${'example.com'}
		${'twitter.com'}
		${'fxtwitter.com'}
		${'foo/bar'}
		${'file://foo/bar'}
	`(
		'returns an empty array if there are no proper links',
		async ({ content }: { content: string }) => {
			const urls = findTwitterURLs(content);
			expect(urls).toEqual([]);
		}
	);

	test.each`
		content
		${'https://fxtwitter.com/example'}
		${'https://example.com'}
	`(
		'returns an empty array if none of the links are Twitter links',
		async ({ content }: { content: string }) => {
			const urls = findTwitterURLs(content);
			expect(urls).toEqual([]);
		}
	);

	test.each`
		content                                              | result
		${'https://twitter.com/example'}                     | ${[new URL('https://twitter.com/example')]}
	`(
		'returns the Twitter links in the target',
		async ({ content, result }: { content: string; result: string }) => {
			const urls = findTwitterURLs(content);
			expect(urls).toEqual(result);
		}
	);

	test.each`
		content                                              | result
		${'https://example.com https://twitter.com/example'} | ${[new URL('https://twitter.com/example')]}
	`(
		'returns ONLY the Twitter links in the target',
		async ({ content, result }: { content: string; result: string }) => {
			const urls = findTwitterURLs(content);
			expect(urls).toEqual(result);
		}
	);

	test.each`
		content                                                        | result
		${'https://twitter.com/example1 https://twitter.com/example2'} | ${[new URL('https://twitter.com/example1'), new URL('https://twitter.com/example2')]}
	`(
		'can return multiple Twitter links in the target',
		async ({ content, result }: { content: string; result: string }) => {
			const urls = findTwitterURLs(content);
			expect(urls).toEqual(result);
		}
	);
});