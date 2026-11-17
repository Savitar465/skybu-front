import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
	BusinessRuleError,
	ServiceUnavailableError,
	UnauthenticatedError,
	UpstreamError,
	ValidationError
} from '#lib/shared/errors/app-error.ts';
import { RecordingLogger } from '#lib/modules/auth/testing/fakes.ts';
import { FetchHttpClient } from './fetch-http-client';

function clientReturning(response: Response | Error) {
	const requests: Request[] = [];
	const fetchFn: typeof fetch = async (input, init) => {
		requests.push(new Request(input, init));
		if (response instanceof Error) throw response;
		return response;
	};
	const client = new FetchHttpClient({
		baseUrl: 'http://api.test',
		timeoutMs: 1000,
		logger: new RecordingLogger(),
		fetchFn
	});
	return { client, requests };
}

const problem = (status: number, body: object) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/problem+json' }
	});

describe('FetchHttpClient', () => {
	it('envía el bearer token y devuelve el cuerpo validado', async () => {
		const { client, requests } = clientReturning(Response.json({ name: 'Ventas' }));

		const body = await client.send({
			method: 'GET',
			path: '/api/v1/roles/1',
			accessToken: 'tok',
			responseSchema: z.object({ name: z.string() })
		});

		expect(body).toEqual({ name: 'Ventas' });
		expect(requests[0].headers.get('Authorization')).toBe('Bearer tok');
	});

	it('traduce problem+json a errores tipados con su código', async () => {
		const send = (response: Response) =>
			clientReturning(response).client.send({
				method: 'POST',
				path: '/api/v1/x',
				responseSchema: null
			});

		await expect(
			send(problem(401, { code: 'invalid_credentials', detail: 'Credenciales inválidas.' }))
		).rejects.toEqual(new UnauthenticatedError('invalid_credentials', 'Credenciales inválidas.'));
		await expect(
			send(problem(422, { code: 'weak_password', detail: 'Débil' }))
		).rejects.toBeInstanceOf(BusinessRuleError);
		await expect(
			send(
				problem(400, {
					code: 'validation_failed',
					detail: 'x',
					errors: [{ field: 'email', message: 'inválido' }]
				})
			)
		).rejects.toMatchObject({ fieldErrors: { email: ['inválido'] } });
		await expect(send(problem(400, {}))).rejects.toBeInstanceOf(ValidationError);
	});

	it('no reenvía al usuario el detalle de un 5xx', async () => {
		const { client } = clientReturning(
			problem(500, { detail: 'NullPointerException en Foo.java:42' })
		);

		await expect(
			client.send({ method: 'GET', path: '/api/v1/x', responseSchema: null })
		).rejects.toEqual(new UpstreamError());
	});

	it('convierte los fallos de red en ServiceUnavailableError', async () => {
		const { client } = clientReturning(new TypeError('fetch failed'));

		await expect(
			client.send({ method: 'GET', path: '/api/v1/x', responseSchema: null })
		).rejects.toBeInstanceOf(ServiceUnavailableError);
	});

	it('rechaza respuestas que no cumplen el contrato', async () => {
		const { client } = clientReturning(Response.json({ unexpected: true }));

		await expect(
			client.send({
				method: 'GET',
				path: '/api/v1/x',
				responseSchema: z.object({ name: z.string() })
			})
		).rejects.toBeInstanceOf(UpstreamError);
	});

	it.each(['//evil.test/api', '/api/../admin', 'http://evil.test', '/other'])(
		'rechaza rutas fuera de la API: %s',
		async (path) => {
			const { client, requests } = clientReturning(Response.json({}));

			await expect(client.send({ method: 'GET', path, responseSchema: null })).rejects.toThrow(
				'Ruta de API no permitida'
			);
			expect(requests).toHaveLength(0);
		}
	);
});
