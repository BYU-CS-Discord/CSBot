/**
 * The private list of all buttons. You can use this to edit the list within this file.
 * @private
 */
const _allButtons = new Map<string, Button>();

/**
 * A read-only list of all buttons.
 * @public
 */
export const allButtons: ReadonlyMap<string, Button> = _allButtons;

/**
 * Adds a button to the list of all buttons.
 * Only public for testing purposes. Do not use outside this file or its tests.
 * @param button The button to add
 * @private
 */
export function _add(button: Button): void {
	const id = button.customId;

	if (_allButtons.has(id)) {
		throw new TypeError(
			`Failed to add button '${id}' when a button with that id was already added`
		);
	}

	_allButtons.set(id, button);
}

/**  Install buttons here:  **/
