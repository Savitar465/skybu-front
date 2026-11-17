import { describe, expect, it } from 'vitest';
import { apiPath, pathSegment } from './api-path';

/** El mismo patrón que aplica `FetchHttpClient` a toda ruta antes de llamar a la API. */
const ALLOWED_API_PATH = /^\/api\/[A-Za-z0-9\-._~/%?=&]*$/;

describe('apiPath', () => {
	it('omite los parámetros vacíos', () => {
		expect(apiPath('/api/v1/products', { search: '', page: 0, size: 20, status: null })).toBe(
			'/api/v1/products?page=0&size=20'
		);
		expect(apiPath('/api/v1/products')).toBe('/api/v1/products');
	});

	it('codifica la búsqueda con caracteres que la API acepta', () => {
		const path = apiPath('/api/v1/products', { search: "café (100% arábica) & co's*!" });

		expect(path).toBe(
			'/api/v1/products?search=caf%C3%A9%20%28100%25%20ar%C3%A1bica%29%20%26%20co%27s%2A%21'
		);
		expect(path).toMatch(ALLOWED_API_PATH);
	});

	it('un segmento de ruta no puede introducir barras ni saltos de directorio', () => {
		expect(pathSegment('../admin')).toBe('..%2Fadmin');
	});
});
