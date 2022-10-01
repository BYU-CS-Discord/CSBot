import { URL } from 'node:url';

/**
 * A link to the bot's public git repository.
 */
export const repo = new URL('https://github.com/BYU-CS-Discord/CSBot');

// If TS throws errors here, run `npm run lint` or `npm run export-version`
export { version as appVersion } from './version';
