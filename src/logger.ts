/**
 * A method that returns the default logger for this application.
 * Uses a function instead of a constant to allow mocking.
 * @returns The default logger for this application
 */
export function getLogger(): Console {
	return console;
}
