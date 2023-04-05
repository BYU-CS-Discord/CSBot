export function sanitize(str: string | null): string | undefined {
	return str?.replaceAll('@', '');
}
