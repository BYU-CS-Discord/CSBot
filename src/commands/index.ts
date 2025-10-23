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
import { emoji } from './emoji.js';
import { findRoom } from './findRoom.js';
import { help } from './help.js';
import { isCasDown } from './isCasDown.js';
import { profile } from './profile.js';
import { scrapeRooms } from './scrapeRooms.js';
import { sendtag } from './sendtag.js';
import { setReactboard } from './setReactboard.js';
import { smite } from './smite.js';
import { unsmite } from './unsmite.js';
import { stats } from './stats.js';
import { talk } from './talk.js';
import { toTheGallows } from './toTheGallows.js';
import { xkcd } from './xkcd.js';

import { altText } from './contextMenu/altText.js';
import { fxtwitter } from './contextMenu/fxtwitter.js';
import { talk as talk_context } from './contextMenu/talk.js';

_add(emoji);
_add(findRoom);
_add(help);
_add(isCasDown);
_add(profile);
_add(scrapeRooms);
_add(sendtag);
_add(setReactboard);
_add(smite);
_add(stats);
_add(unsmite);
_add(talk);
_add(toTheGallows);
_add(xkcd);

_add(altText);
_add(fxtwitter);
_add(talk_context);
