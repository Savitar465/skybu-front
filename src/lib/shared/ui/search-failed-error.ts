/**
 * Una búsqueda remota de un `Combobox` no pudo completarse (red caída, sesión caducada, sin
 * permiso...). Las funciones `search` lo lanzan para que el combobox muestre el fallo en la
 * lista; cualquier otro error es un defecto y se propaga.
 */
export class SearchFailedError extends Error {
	constructor(readonly status: number | null) {
		super('No se pudo completar la búsqueda.');
		this.name = 'SearchFailedError';
	}
}
