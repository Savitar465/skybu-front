import type { ResolvedPathname } from '$app/types';

/**
 * Añade parámetros de consulta a una ruta ya resuelta con `resolve()`. Omite los parámetros
 * vacíos para que las URL de filtros y paginación sean cortas y canónicas.
 */
export function withQuery(
	resolvedPath: ResolvedPathname,
	params: Readonly<Record<string, string | number | null | undefined>>
): ResolvedPathname {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== null && value !== undefined && value !== '') {
			search.set(key, String(value));
		}
	}
	const query = search.toString();
	// Añadir una query a una ruta resuelta no cambia su base: sigue siendo una ruta resuelta.
	return query ? (`${resolvedPath}?${query}` as ResolvedPathname) : resolvedPath;
}
