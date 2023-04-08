export function sanitize(str: string): string;
export function sanitize(str: null): undefined;
export function sanitize(str: string | null): string | undefined;

export function sanitize(str: string | null): string | undefined {
	return str?.replaceAll('@', '');
}
