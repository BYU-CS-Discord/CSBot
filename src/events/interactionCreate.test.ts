// Create a mocked interaction to toggle 'isCommand' on/off
const mockInteractionIsCommand = jest.fn();

const mockInteraction = {
	isCommand: mockInteractionIsCommand,
};

// Mock handleInteraction to isolate our test code
jest.mock('../handleInteraction');
import { handleInteraction } from '../handleInteraction';
const mockHandleInteraction = handleInteraction as jest.Mock;

// Mock the logger to track error output
jest.mock('../logger');
import { getLogger } from '../logger';
const mockGetLogger = getLogger as jest.Mock;
const mockConsoleError = jest.fn();
mockGetLogger.mockImplementation(() => {
	return {
		error: mockConsoleError,
	} as unknown as Console;
});

// Import the code to test
import { interactionCreate } from './interactionCreate';

// A basic error to test with
const interactionError = new Error('Failed to handle interaction. This is a test.');

describe('on(interactionCreate)', () => {
	beforeEach(() => {
		// The default is handleInteraction does nothing and isCommand=true
		mockHandleInteraction.mockResolvedValue(undefined);
		mockInteractionIsCommand.mockReturnValue(true);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('calls the interaction handler if the interaction is a command', async () => {
		await expect(interactionCreate.execute(mockInteraction)).resolves.toBeUndefined();
		expect(mockHandleInteraction).toHaveBeenCalledWith(mockInteraction);
	});

	test("doesn't call interaction handler if the interaction isn't a command", async () => {
		mockInteractionIsCommand.mockReturnValue(false);
		await expect(interactionCreate.execute(mockInteraction)).resolves.toBeUndefined();
		expect(mockHandleInteraction).not.toHaveBeenCalled();
	});

	test('reports interaction errors', async () => {
		mockHandleInteraction.mockRejectedValueOnce(interactionError);
		await expect(interactionCreate.execute(mockInteraction)).resolves.toBeUndefined();
		expect(mockConsoleError).toHaveBeenCalledWith(
			expect.stringContaining('handle interaction'),
			interactionError
		);
	});
});
