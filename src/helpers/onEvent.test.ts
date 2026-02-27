import { describe, expect, test } from 'vitest';

import { Events } from 'discord.js';

import { onEvent } from './onEvent.js';

const executeMock = (): void => undefined;

describe('Creating event handlers', () => {
	// We shouldn't have to worry about testing with poorly-formatted arguments.
	// Since this is an internal tool, not one for a public SDK, we expect
	// TypeScript to yell at any dev silly enough to include too many or too
	// few arguments, or arguments of the wrong type.

	test('creates a proper event handler', () => {
		const handler = onEvent(Events.ClientReady, {
			once: true,
			execute: executeMock,
		});
		expect(handler).toHaveProperty('name', Events.ClientReady);
		expect(handler).toHaveProperty('once', true);
		expect(handler).toHaveProperty('execute', executeMock);
	});
});
