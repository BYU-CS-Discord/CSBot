// Dependencies
import type { ClientEvents } from 'discord.js';

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
		expect(Object.keys(allEventHandlers).length).toBeGreaterThan(0);
	});

	test('fails to install another event handler with the same name', () => {
		const mockErrorHandler = { name: 'error' } as unknown as EventHandler<keyof ClientEvents>;
		expect(() => _add(mockErrorHandler)).toThrow(TypeError);
	});

	test('properly registers events', () => {
		// To test if event handler registration is working correctly,
		// this test creates fake handlers and then registers them,
		// and then checks that the client's registration methods were
		// given the correct fake event handler.

		// Be sure to clear all the auto-added event handlers first, or else they'll mess up our count.
		// Casting a read-only list into a regular list is bad practice, but this is for testing purposes.
		// Don't do this at home.
		for (const key of Object.keys(allEventHandlers)) {
			// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
			delete allEventHandlers[key as keyof typeof allEventHandlers];
		}

		const fakeReadyEvent: EventHandler<'ready'> = {
			name: 'ready',
			once: true,
			execute: () => undefined,
		};
		const fakeMessageEvent: EventHandler<'messageCreate'> = {
			name: 'messageCreate',
			once: false,
			execute: () => undefined,
		};
		expect(_add(fakeReadyEvent as EventHandler<keyof ClientEvents>)).toBeUndefined();
		expect(_add(fakeMessageEvent as EventHandler<keyof ClientEvents>)).toBeUndefined();

		expect(registerEventHandlers(client)).toBeUndefined();

		expect(mockOnce).toHaveBeenCalledWith(fakeReadyEvent.name, fakeReadyEvent.execute);
		expect(mockOn).toHaveBeenCalledWith(fakeMessageEvent.name, fakeMessageEvent.execute);
	});
});
