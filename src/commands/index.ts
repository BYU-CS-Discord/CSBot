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
	const name = cmd.info.name;

	if (_allCommands.has(name)) {
		throw new TypeError(
			`Failed to add command '${name}' when a command with that name was already added`
		);
	}

	_allCommands.set(name, cmd);
}

/**  Install commands here:  **/
import { emoji } from './emoji';
import { findRoom } from './findRoom';
import { help } from './help';
import { isCasDown } from './isCasDown';
import { profile } from './profile';
import { sendtag } from './sendtag';
import { stats } from './stats';
import { talk } from './talk';
import { toTheGallows } from './toTheGallows';
import { update } from './update';
import { xkcd } from './xkcd';

import { altText } from './contextMenu/altText';
import { fxtwitter } from './contextMenu/fxtwitter';
import { talk as talk_context } from './contextMenu/talk';

_add(emoji);
_add(findRoom);
_add(help);
_add(isCasDown);
_add(profile);
_add(sendtag);
_add(stats);
_add(talk);
_add(toTheGallows);
_add(update);
_add(xkcd);

_add(altText);
_add(fxtwitter);
_add(talk_context);
