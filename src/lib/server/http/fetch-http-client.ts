import type { z } from 'zod';
import { ServiceUnavailableError, UpstreamError } from '#lib/shared/errors/app-error.ts';
import type { Logger } from '#lib/shared/logging/logger.ts';
import type { HttpClient, HttpRequest, HttpResponseBody } from './http-client';
import { problemToAppError } from './problem-details';

const API_PATH_PATTERN = /^\/api\/[A-Za-z0-9\-._~/%?=&]*$/;
const NO_CONTENT = 204;

export interface FetchHttpClientOptions {
	readonly baseUrl: string;
	readonly timeoutMs: number;
	readonly logger: Logger;
	/** Inyectable para tests; por defecto el `fetch` global. */
	readonly fetchFn?: typeof fetch;
}

/**
 * Implementación de `HttpClient` sobre `fetch`.
 *
 * - Solo acepta rutas bajo `/api/`: un path construido con datos de entrada nunca puede
 *   convertirse en una URL a otro host (SSRF).
 * - Aplica un timeout a cada llamada para no dejar peticiones colgadas.
 * - Traduce errores de red a `ServiceUnavailableError` y respuestas de error a `AppError`.
 * - Valida cada respuesta con su esquema Zod: lo que no cumple el contrato no entra.
 */
export class FetchHttpClient implements HttpClient {
	private readonly fetchFn: typeof fetch;

	constructor(private readonly options: FetchHttpClientOptions) {
		this.fetchFn = options.fetchFn ?? fetch;
	}

	async send<Schema extends z.ZodType | null>(
		request: HttpRequest<Schema>
	): Promise<HttpResponseBody<Schema>> {
		const response = await this.execute(request);
		if (!response.ok) {
			throw problemToAppError(response.status, await readJsonSafely(response));
		}
		return this.parseBody(request, response);
	}

	private async execute(request: HttpRequest<z.ZodType | null>): Promise<Response> {
		assertApiPath(request.path);
		try {
			return await this.fetchFn(`${this.options.baseUrl}${request.path}`, {
				method: request.method,
				headers: buildHeaders(request),
				body: request.body === undefined ? undefined : JSON.stringify(request.body),
				signal: AbortSignal.timeout(this.options.timeoutMs),
				redirect: 'error'
			});
		} catch (error) {
			if (isNetworkOrTimeoutError(error)) {
				this.options.logger.error('La API no respondió', {
					method: request.method,
					path: request.path,
					reason: error.name
				});
				throw new ServiceUnavailableError();
			}
			throw error;
		}
	}

	private async parseBody<Schema extends z.ZodType | null>(
		request: HttpRequest<Schema>,
		response: Response
	): Promise<HttpResponseBody<Schema>> {
		if (request.responseSchema === null) {
			return undefined as HttpResponseBody<Schema>;
		}
		if (response.status === NO_CONTENT) {
			throw this.contractViolation(request, 'respuesta vacía');
		}
		const result = request.responseSchema.safeParse(await readJsonSafely(response));
		if (!result.success) {
			// Solo se registran las rutas de los campos inválidos, nunca sus valores (pueden ser tokens).
			throw this.contractViolation(
				request,
				result.error.issues.map((issue) => issue.path.join('.')).join(', ')
			);
		}
		return result.data as HttpResponseBody<Schema>;
	}

	private contractViolation(request: HttpRequest<z.ZodType | null>, detail: string): UpstreamError {
		this.options.logger.error('La respuesta de la API no cumple el contrato esperado', {
			method: request.method,
			path: request.path,
			detail
		});
		return new UpstreamError();
	}
}

function assertApiPath(path: string): void {
	if (!API_PATH_PATTERN.test(path) || path.includes('..')) {
		throw new Error(`Ruta de API no permitida: ${path}`);
	}
}

function buildHeaders(request: HttpRequest<z.ZodType | null>): Headers {
	const headers = new Headers({ Accept: 'application/json, application/problem+json' });
	if (request.body !== undefined) {
		headers.set('Content-Type', 'application/json');
	}
	if (request.accessToken) {
		headers.set('Authorization', `Bearer ${request.accessToken}`);
	}
	return headers;
}

/** `fetch` lanza `TypeError` ante fallos de red y `DOMException` (TimeoutError/AbortError) ante el timeout. */
function isNetworkOrTimeoutError(error: unknown): error is Error {
	if (error instanceof TypeError) {
		return true;
	}
	return (
		error instanceof DOMException && (error.name === 'TimeoutError' || error.name === 'AbortError')
	);
}

/** Un cuerpo vacío o que no es JSON se trata como ausente: el esquema decidirá si es aceptable. */
async function readJsonSafely(response: Response): Promise<unknown> {
	const text = await response.text();
	if (text.length === 0) {
		return undefined;
	}
	try {
		return JSON.parse(text);
	} catch (error) {
		if (error instanceof SyntaxError) {
			return undefined;
		}
		throw error;
	}
}
