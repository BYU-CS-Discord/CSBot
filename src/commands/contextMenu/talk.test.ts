import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { speak } from '../talk.ts';

// Mock the talkMessage functionality
const speakMock = vi.hoisted(() => vi.fn<typeof speak>());
vi.mock('../talk.ts', () => ({
	speak: speakMock,
}));

// Mock the logger so nothing is printed
vi.mock('../../logger.ts');

// Import the code to test
import { talk } from './talk.ts';

describe('Talk Context Menu Command', () => {
	let context: MessageContextMenuCommandContext;

	beforeEach(() => {
		context = {
			targetMessage: {
				content: 'test',
			},
		} as unknown as MessageContextMenuCommandContext;
	});

	// Because most of the functionality of the talk context menu is actually contained in the talk slash command,
	// we don't actually have to test much.
	test('Calls the talkMessage method of the talk slash command', async () => {
		await talk.execute(context);
		expect(speakMock).toHaveBeenCalledOnce();
	});
});
