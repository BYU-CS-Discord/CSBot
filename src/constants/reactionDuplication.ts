// TODO: Make these configurable
export const DEFAULT_CHANCE = 100;

// The chances, where 1 is always, 100 is once every 100 times, and 0 is never.
// We're using integers here because floating-point math is silly
export const chances: Record<string, number> = {
	no_u: 5,
	nou: 5,
	same: 5,
	'⭐': 0, // certain default emoji are represented in the API as emoji characters, not names
};
