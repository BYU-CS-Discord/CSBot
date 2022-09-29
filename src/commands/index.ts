export const allCommands = new Map<string, Command>();

/**  Install commands here:  **/
import { help } from './help';
_add(help);

export function _add(cmd: Command): void {
	const name = cmd.name;

	if (allCommands.has(name)) {
		throw new TypeError(
			`Failed to add command '${name}' when a command with that name was already added`
		);
	}

	allCommands.set(name, cmd);
}
