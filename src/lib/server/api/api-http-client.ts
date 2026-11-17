import { SKYBU_API_TIMEOUT_MS, SKYBU_API_URL } from '$app/env/private';
import { consoleLogger } from '#lib/shared/logging/logger.ts';
import { FetchHttpClient } from '#lib/server/http/fetch-http-client.ts';
import type { HttpClient } from '#lib/server/http/http-client.ts';

/**
 * Cliente HTTP compartido hacia la API de SkyBu. Es la única instancia que conoce la URL real
 * del backend; el resto del código depende de la interfaz `HttpClient`.
 */
export const apiHttpClient: HttpClient = new FetchHttpClient({
	baseUrl: SKYBU_API_URL,
	timeoutMs: SKYBU_API_TIMEOUT_MS,
	logger: consoleLogger
});
