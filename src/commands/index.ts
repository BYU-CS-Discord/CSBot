/**
 * The private list of all commands. You can use this to edit the list within this file.
 * @private
 */
const _allCommands = new Map<string, Command>();

/**
 * A read-only list of all commands.
 * @public
 */
export const allCommands: ReadonlyMap<string, Command> = _allCommands;

/**
 * Adds a command to the list of all commands.
 * Only public for testing purposes. Do not use outside this file or its tests.
 * @param cmd The command to add
 * @private
 */
export function _add(cmd: Command): void {
	const name = cmd.name;

	if (_allCommands.has(name)) {
		throw new TypeError(
			`Failed to add command '${name}' when a command with that name was already added`
		);
	}

	_allCommands.set(name, cmd);
}

/**  Install commands here:  **/
import { help } from './help';
import { xkcd } from './xkcd';
import { profile } from './profile';
_add(help);
_add(xkcd);
_add(profile);
