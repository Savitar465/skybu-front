import type { z } from 'zod';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Petición a la API. `responseSchema` es obligatorio salvo para respuestas sin cuerpo (204):
 * toda respuesta se valida antes de entrar en la aplicación.
 */
export interface HttpRequest<Schema extends z.ZodType | null> {
	readonly method: HttpMethod;
	/** Ruta relativa a la API, siempre bajo `/api/` (p. ej. `/api/v1/auth/login`). */
	readonly path: string;
	readonly body?: unknown;
	readonly accessToken?: string;
	readonly responseSchema: Schema;
}

export type HttpResponseBody<Schema extends z.ZodType | null> = Schema extends z.ZodType
	? z.output<Schema>
	: void;

/**
 * Puerto de salida hacia la API REST. Los gateways dependen de esta interfaz, no de `fetch`,
 * para poder probarlos con un doble sin red.
 *
 * Contrato: devuelve el cuerpo ya validado o lanza un `AppError` tipado; nunca devuelve una
 * respuesta de error ni lanza errores de red sin traducir.
 */
export interface HttpClient {
	send<Schema extends z.ZodType | null>(
		request: HttpRequest<Schema>
	): Promise<HttpResponseBody<Schema>>;
}
