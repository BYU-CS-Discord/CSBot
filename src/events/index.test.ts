import { describe, expect, test, vi } from 'vitest';

// Create a mocked client to track 'on' and 'once' calls
const mockOn = vi.fn<Client['on']>();
const mockOnce = vi.fn<Client['once']>();
const MockClient = vi.hoisted(() => {
	return class {
		public on = mockOn;
		public once = mockOnce;
	};
});

// Overwrite discord.js to use the MockClient instead of Client
vi.mock('discord.js', async () => {
	const Discord = await vi.importActual<typeof import('discord.js')>('discord.js');
	return {
		...Discord,
		Client: MockClient,
	};
});

// Re-import Client (which is now MockedClient) so we can use it
import { Client } from 'discord.js';
const client = new Client({ intents: [] });

// Mock the logger so nothing is printed
vi.mock('../logger.js');

// Import the code to test
import { _add, allEventHandlers, registerEventHandlers } from './index.js';

describe('allEvents', () => {
	test('index is not empty', () => {
		expect(allEventHandlers.size).toBeGreaterThan(0);
	});

	test('fails to install another event handler with the same name', () => {
		const mockErrorHandler = { name: 'error' } as unknown as EventHandler;
		expect(() => {
			_add(mockErrorHandler);
		}).toThrow(TypeError);
	});

	test('properly registers events', () => {
		// To test if event handler registration is working correctly,
		// this test creates fake handlers and then registers them,
		// and then checks that the client's registration methods were
		// given the correct fake event handler.

		// Be sure to clear all the auto-added event handlers first, or else they'll mess up our count.
		// Casting a read-only list into a regular list is bad practice, but this is for testing purposes.
		// Don't do this at home.
		(allEventHandlers as Map<string, unknown>).clear();

		const fakeReadyEvent: EventHandler = {
			name: 'ready',
			once: true,
			execute: vi.fn(),
		};
		const fakeMessageEvent: EventHandler = {
			name: 'messageCreate',
			once: false,
			execute: vi.fn(),
		};
		_add(fakeReadyEvent);
		_add(fakeMessageEvent);
		registerEventHandlers(client);

		// Anonymous functions were registered, but we can still check if they were the same function by calling them
		expect(mockOnce).toHaveBeenCalledOnce();
		mockOnce.mock.calls.at(0)?.[1]?.();
		expect(fakeReadyEvent.execute).toHaveBeenCalledOnce();
		expect(mockOn).toHaveBeenCalledOnce();
		mockOn.mock.calls.at(0)?.[1]?.();
		expect(fakeMessageEvent.execute).toHaveBeenCalledOnce();
	});
});
