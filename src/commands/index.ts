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
import { emoji } from './emoji.ts';
import { findRoom } from './findRoom.ts';
import { help } from './help.ts';
import { isCasDown } from './isCasDown.ts';
import { profile } from './profile.ts';
import { sendtag } from './sendtag.ts';
import { setReactboard } from './setReactboard.ts';
import { stats } from './stats.ts';
import { talk } from './talk.ts';
import { toTheGallows } from './toTheGallows.ts';
import { xkcd } from './xkcd.ts';

import { altText } from './contextMenu/altText.ts';
import { fxtwitter } from './contextMenu/fxtwitter.ts';
import { talk as talk_context } from './contextMenu/talk.ts';

_add(emoji);
_add(findRoom);
_add(help);
_add(isCasDown);
_add(profile);
_add(sendtag);
_add(setReactboard);
_add(stats);
_add(talk);
_add(toTheGallows);
_add(xkcd);

_add(altText);
_add(fxtwitter);
_add(talk_context);
