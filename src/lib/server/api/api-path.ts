type QueryValue = string | number | boolean | null | undefined;

/**
 * Construye la ruta de una llamada a la API con su query string.
 *
 * Codifica con `encodeURIComponent` (espacio → `%20`, no `+`) y escapa además `!'()*`, de modo
 * que el resultado solo contiene caracteres que `FetchHttpClient` acepta en una ruta. Los
 * parámetros nulos, indefinidos o vacíos se omiten: la API aplica entonces su valor por defecto.
 */
export function apiPath(path: string, query: Readonly<Record<string, QueryValue>> = {}): string {
	const pairs = Object.entries(query)
		.filter((entry): entry is [string, string | number | boolean] => {
			const value = entry[1];
			return value !== null && value !== undefined && value !== '';
		})
		.map(([key, value]) => `${encodeStrict(key)}=${encodeStrict(String(value))}`);
	return pairs.length > 0 ? `${path}?${pairs.join('&')}` : path;
}

/** Segmento de ruta con un dato de entrada (p. ej. un id): nunca puede introducir `/` ni `..`. */
export function pathSegment(value: string): string {
	return encodeStrict(value);
}

function encodeStrict(value: string): string {
	return encodeURIComponent(value).replace(
		/[!'()*]/g,
		(character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`
	);
}
