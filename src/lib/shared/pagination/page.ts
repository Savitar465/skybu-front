/**
 * Página de resultados de un listado. `pageIndex` empieza en 0, como en la API; la UI muestra
 * y recibe en la URL páginas que empiezan en 1 (ver `toPageRequest`).
 */
export interface Page<T> {
	readonly items: readonly T[];
	readonly pageIndex: number;
	readonly size: number;
	readonly totalElements: number;
	readonly totalPages: number;
}

export interface PageRequest {
	readonly pageIndex: number;
	readonly size: number;
}

/** Convierte el número de página visible (1, 2, 3...) en la petición a la API. */
export function toPageRequest(pageNumber: number, size: number): PageRequest {
	return { pageIndex: Math.max(0, pageNumber - 1), size };
}

export function mapPage<T, R>(page: Page<T>, mapItem: (item: T) => R): Page<R> {
	return { ...page, items: page.items.map(mapItem) };
}
