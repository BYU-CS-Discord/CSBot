import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the talkMessage functionality
const mockSpeak = vi.hoisted(() => vi.fn());
vi.mock('../talk', () => ({
	speak: mockSpeak,
}));

// Mock the logger so nothing is printed
vi.mock('../../logger');

// Import the code to test
import { talk } from './talk';

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
		await expect(talk.execute(context)).resolves.toBeUndefined();
		expect(mockSpeak).toHaveBeenCalledOnce();
	});
});
