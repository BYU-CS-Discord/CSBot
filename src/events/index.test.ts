// Create a mocked client to track 'on' and 'once' calls
const mockOn = jest.fn();
const mockOnce = jest.fn();
class MockClient {
	on = mockOn;
	once = mockOnce;
}

// Overwrite discord.js to use the MockClient instead of Client
const Discord = jest.requireActual<typeof import('discord.js')>('discord.js');
jest.mock('discord.js', () => ({
	...Discord,
	Client: MockClient,
}));

// Re-import Client (which is now MockedClient) so we can use it
import { Client } from 'discord.js';
const client = new Client({ intents: [] });

// Mock the logger so the code doesn't print to the console
jest.mock('../logger');
import { getLogger } from '../logger';
const mockGetLogger = getLogger as jest.Mock;
mockGetLogger.mockImplementation(() => {
	return {
		info: () => undefined,
	} as unknown as Console;
});

// Import the code to test
import { _add, allEventHandlers, registerEventHandlers } from './index';

describe('allEvents', () => {
	test('index is not empty', () => {
		expect(allEventHandlers.size).toBeGreaterThan(0);
	});

	test('fails to install another event handler with the same name', () => {
		expect(() => _add({ name: 'error' } as unknown as EventHandler)).toThrow(TypeError);
	});

	test('properly registers events', () => {
		allEventHandlers.clear();

		// To test if event handler registration is working correctly,
		// this test adds an arbitrary amount of event handlers (both 'on' and 'once'),
		// registers them, and then checks to make sure the correct number of handlers
		// were registered for 'on' and 'once'.

		// Set these values to anything you want, doesn't matter
		const numOnTests = 3;
		const numOnceTests = 5;

		for (let i = 0; i < numOnTests; i++) {
			expect(
				_add({
					name: `testOn${i}`,
					once: false,
					execute: () => undefined,
				})
			).toBeUndefined();
		}
		for (let i = 0; i < numOnceTests; i++) {
			expect(
				_add({
					name: `testOnce${i}`,
					once: true,
					execute: () => undefined,
				})
			).toBeUndefined();
		}

		expect(registerEventHandlers(client)).toBeUndefined();

		expect(mockOn).toHaveBeenCalledTimes(numOnTests);
		expect(mockOnce).toHaveBeenCalledTimes(numOnceTests);
	});
});
