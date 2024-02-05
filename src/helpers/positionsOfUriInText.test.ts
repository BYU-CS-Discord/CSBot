import { describe, expect, test, vi } from 'vitest';

// As far as we know, the uriRegex will only match strings that are valid URIs.
// But in order to test what would happen if not, we need to override the URL.canParse method to
// return false for a specific string. For all other tests, we want to use the default implementation.
const canParseMock = vi.hoisted(vi.fn);
vi.mock('node:url', async () => {
	const nodeURL = await vi.importActual<typeof import('node:url')>('node:url');
	return {
		...nodeURL,
		URL: {
			canParse: canParseMock.mockImplementation((input: string, base?: string) =>
				nodeURL.URL.canParse(input, base)
			),
		},
	};
});

import type { Range } from './positionsOfUriInText';
import { positionsOfUriInText } from './positionsOfUriInText';

describe('Identifying URIs in strings', () => {
	test.each`
		msg                                                            | ranges
		${''}                                                          | ${[]}
		${'nothing'}                                                   | ${[]}
		${'still nothing'}                                             | ${[]}
		${'https://nope'}                                              | ${[]}
		${'https://yep.com'}                                           | ${[{ start: 0, end: 15 }]}
		${'https://yep.com at the start'}                              | ${[{ start: 0, end: 15 }]}
		${'at the end https://yep.com'}                                | ${[{ start: 11, end: 26 }]}
		${'at the end https://yep.com there is more text'}             | ${[{ start: 11, end: 26 }]}
		${'https://yep.com https://yep.com'}                           | ${[{ start: 0, end: 15 }, { start: 16, end: 31 }]}
		${'https://yep.com stuff https://yep.com'}                     | ${[{ start: 0, end: 15 }, { start: 22, end: 37 }]}
		${'starts https://yep.com and https://yep.com'}                | ${[{ start: 7, end: 22 }, { start: 27, end: 42 }]}
		${'https://yep.com then https://yep.com ends'}                 | ${[{ start: 0, end: 15 }, { start: 21, end: 36 }]}
		${'https://yep.com https://yep.com then https://yep.com ends'} | ${[{ start: 0, end: 15 }, { start: 16, end: 31 }, { start: 37, end: 52 }]}
	`(
		"correctly identifies URI substring range(s) in string '$msg'",
		({ msg, ranges }: { msg: string; ranges: Array<Range> | null }) => {
			expect(positionsOfUriInText(msg)).toStrictEqual(ranges);
		}
	);

	test('will not include matches that URL.canParse cannot parse', () => {
		canParseMock.mockReturnValueOnce(false);
		expect(positionsOfUriInText('https://yep.com')).toStrictEqual([]);
	});
});
