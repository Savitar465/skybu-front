import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

/**
 * Variables de entorno validadas al arrancar. Si falta alguna o no es válida, la aplicación no
 * arranca (fallo rápido en lugar de errores difusos en tiempo de ejecución).
 *
 * Todas son privadas: solo el servidor de SvelteKit (BFF) habla con la API, así que la URL del
 * backend nunca llega al navegador.
 */
export const variables = defineEnvVars({
	SKYBU_API_URL: {
		description: 'URL base de la API de SkyBu, p. ej. http://localhost:8080',
		schema: z.url({ protocol: /^https?$/ }).transform((url) => url.replace(/\/+$/, ''))
	},
	SKYBU_API_TIMEOUT_MS: {
		description: 'Tiempo máximo de espera de cada llamada a la API, en milisegundos.',
		schema: z.string().default('10000').pipe(z.coerce.number<string>().int().min(500).max(60_000))
	}
});
