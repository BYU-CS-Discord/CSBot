import { describe, expect, test, vi } from 'vitest';

// Create a mocked client to track 'on' and 'once' calls
const mockOn = vi.fn();
const mockOnce = vi.fn();
const MockClient = vi.hoisted(() => {
	return class {
		on = mockOn;
		once = mockOnce;
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
vi.mock('../logger');

// Import the code to test
import { _add, allEventHandlers, registerEventHandlers } from './index';

describe('allEvents', () => {
	test('index is not empty', () => {
		expect(allEventHandlers.size).toBeGreaterThan(0);
	});

	test('fails to install another event handler with the same name', () => {
		const mockErrorHandler = { name: 'error' } as unknown as EventHandler;
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
		(allEventHandlers as Map<string, unknown>).clear();

		const fakeReadyEvent: EventHandler = {
			name: 'ready',
			once: true,
			execute: () => undefined,
		};
		const fakeMessageEvent: EventHandler = {
			name: 'messageCreate',
			once: false,
			execute: () => undefined,
		};
		expect(_add(fakeReadyEvent)).toBeUndefined();
		expect(_add(fakeMessageEvent)).toBeUndefined();

		expect(registerEventHandlers(client)).toBeUndefined();

		expect(mockOnce).toHaveBeenCalledWith(fakeReadyEvent.name, fakeReadyEvent.execute);
		expect(mockOn).toHaveBeenCalledWith(fakeMessageEvent.name, fakeMessageEvent.execute);
	});
});
