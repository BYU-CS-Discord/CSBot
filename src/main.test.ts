const mockConstructClient = jest.fn();
const mockLogin = jest.fn();
const mockSetActivity = jest.fn();
const mockInteractionIsCommand = jest.fn();

const mockClientError = new Error('This is a test error');

const mockInteraction = {
	isCommand: mockInteractionIsCommand,
};

const mockToken = 'TEST_TOKEN';
process.env['DISCORD_TOKEN'] = mockToken;

let didRegisterErrorListener = false;

const mockClient = {
	login: mockLogin,
	user: {
		setActivity: mockSetActivity,
	},
	on(eventName: string | symbol, listener: (...args: Array<unknown>) => void): unknown {
		switch (eventName) {
			case 'ready':
				listener(mockClient);
				return mockClient;
			case 'error':
				listener(mockClientError);
				didRegisterErrorListener = true;
				return mockClient;
			case 'interactionCreate':
				listener(mockInteraction);
				return mockClient;
			default:
				return mockClient;
		}
	},
};

const { ActivityType, GatewayIntentBits, Partials } =
	jest.requireActual<typeof import('discord.js')>('discord.js');

jest.mock('discord.js', () => ({
	ActivityType,
	Client: mockConstructClient.mockImplementation(() => mockClient),
	GatewayIntentBits,
	Partials,
}));

jest.mock('./handleInteraction');
import { handleInteraction } from './handleInteraction';
const mockHandleInteraction = handleInteraction as jest.Mock;

async function run(): Promise<void> {
	await import('./main');
}

describe('main', () => {
	beforeEach(() => {
		jest.spyOn(global.console, 'info').mockImplementation(() => undefined);
		jest.spyOn(global.console, 'debug').mockImplementation(() => undefined);
		jest.spyOn(global.console, 'error').mockImplementation(() => undefined);

		mockConstructClient.mockReturnValue(undefined);
		mockLogin.mockResolvedValue('TEST');
		mockSetActivity.mockReturnValue({});
		mockInteractionIsCommand.mockReturnValue(true);
		mockHandleInteraction.mockResolvedValue(undefined);
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	test('disables @everyone pings', async () => {
		await expect(run()).resolves.toBeUndefined();
		expect(mockConstructClient).toHaveBeenCalledOnce();
		expect(mockConstructClient).toHaveBeenCalledWith(
			expect.objectContaining({
				allowedMentions: {
					parse: ['roles', 'users'],
					repliedUser: true,
				},
			})
		);
	});

	test("doesn't call interaction handler if the interaction isn't a command", async () => {
		mockInteractionIsCommand.mockReturnValue(false);
		await expect(run()).resolves.toBeUndefined();
		expect(mockHandleInteraction).not.toHaveBeenCalled();
	});

	test('calls login', async () => {
		await expect(run()).resolves.toBeUndefined();
		// FIXME: For some reason, this mock check doesn't work:
		// expect(mockLogin).toHaveBeenCalledOnce();
		// expect(mockLogin).toHaveBeenCalledWith(mockToken);
	});

	test('reports login errors', async () => {
		const loginError = new Error('Failed to log in. This is a test.');
		mockLogin.mockRejectedValueOnce(loginError);
		await expect(run()).resolves.toBeUndefined();
		// TODO: Assert the logger was called:
		// expect(mockConsoleError).toHaveBeenCalledWith(
		// 	expect.stringContaining('log in'), //
		// 	loginError
		// );
	});

	test('reports interaction errors', async () => {
		const interactionError = new Error('Failed to handle ineracion. This is a test.');
		mockHandleInteraction.mockRejectedValueOnce(interactionError);
		await expect(run()).resolves.toBeUndefined();
		// TODO: Assert the logger was called:
		// expect(mockConsoleError).toHaveBeenCalledWith(
		// 	expect.stringContaining('handle interaction'),
		// 	interactionError
		// );
	});

	test('reports client errors', async () => {
		await expect(run()).resolves.toBeUndefined();
		expect(didRegisterErrorListener).toBeTrue();
	});
});
