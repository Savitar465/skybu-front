import type { z } from 'zod';
import type { HttpClient, HttpRequest, HttpResponseBody } from '#lib/server/http/http-client.ts';

/**
 * Doble de `HttpClient` para probar adaptadores sin red: registra cada petición y responde con
 * el cuerpo programado, **pasándolo por el `responseSchema`** de la petición. Así el test cubre
 * también el contrato (lo que el adaptador acepta y cómo lo transforma).
 */
export class FakeHttpClient implements HttpClient {
	readonly requests: HttpRequest<z.ZodType | null>[] = [];
	private responseBody: unknown = undefined;
	private failure: Error | null = null;

	respondWith(body: unknown): this {
		this.responseBody = body;
		this.failure = null;
		return this;
	}

	failWith(error: Error): this {
		this.failure = error;
		return this;
	}

	get lastRequest(): HttpRequest<z.ZodType | null> {
		const request = this.requests.at(-1);
		if (!request) {
			throw new Error('No se envió ninguna petición');
		}
		return request;
	}

	async send<Schema extends z.ZodType | null>(
		request: HttpRequest<Schema>
	): Promise<HttpResponseBody<Schema>> {
		this.requests.push(request);
		if (this.failure) {
			throw this.failure;
		}
		if (request.responseSchema === null) {
			return undefined as HttpResponseBody<Schema>;
		}
		return request.responseSchema.parse(this.responseBody) as HttpResponseBody<Schema>;
	}
}
