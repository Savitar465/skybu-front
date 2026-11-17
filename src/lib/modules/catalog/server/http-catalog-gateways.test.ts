import { describe, expect, it } from 'vitest';
import { ConflictError } from '#lib/shared/errors/app-error.ts';
import { FakeHttpClient } from '#lib/server/testing/fake-http-client.ts';
import { ACCESS_TOKEN } from '../testing/fakes';
import { HttpCategoryGateway } from './http-category-gateway';
import { HttpProductGateway } from './http-product-gateway';

const PRODUCT_ID = '10000000-0000-4000-8000-000000000001';
const CATEGORY_ID = '20000000-0000-4000-8000-000000000001';

const productView = {
	id: PRODUCT_ID,
	sku: 'CAF-250',
	name: 'Café molido 250 g',
	description: null,
	type: 'GOODS',
	categoryId: CATEGORY_ID,
	listPrice: 35.5,
	taxRatePercent: 13.0,
	status: 'ACTIVE',
	createdAt: '2026-01-01T12:00:00Z'
};

const input = {
	sku: 'CAF-250',
	name: 'Café molido 250 g',
	description: null,
	type: 'GOODS' as const,
	categoryId: CATEGORY_ID,
	listPrice: 35.5,
	taxRatePercent: 13
};

describe('HttpProductGateway', () => {
	it('busca con filtros y valida cada producto', async () => {
		const http = new FakeHttpClient().respondWith({
			items: [productView],
			page: 0,
			size: 20,
			totalElements: 1,
			totalPages: 1
		});

		const page = await new HttpProductGateway(http).list(ACCESS_TOKEN, {
			search: 'café',
			includeInactive: false,
			page: { pageIndex: 0, size: 20 }
		});

		expect(http.lastRequest.path).toBe(
			'/api/v1/products?search=caf%C3%A9&includeInactive=false&page=0&size=20'
		);
		expect(page.items[0]).toMatchObject({
			sku: 'CAF-250',
			createdAt: new Date('2026-01-01T12:00:00Z')
		});
	});

	it('crea y actualiza con el cuerpo de SaveProductRequest', async () => {
		const http = new FakeHttpClient().respondWith(productView);
		const gateway = new HttpProductGateway(http);

		await gateway.create(ACCESS_TOKEN, input);
		await gateway.update(ACCESS_TOKEN, PRODUCT_ID, input);

		expect(http.requests.map((request) => [request.method, request.path])).toEqual([
			['POST', '/api/v1/products'],
			['PUT', `/api/v1/products/${PRODUCT_ID}`]
		]);
		expect(http.lastRequest.body).toEqual(input);
	});

	it('activa y desactiva con sus subrecursos y sin cuerpo de respuesta', async () => {
		const http = new FakeHttpClient();
		const gateway = new HttpProductGateway(http);

		await gateway.deactivate(ACCESS_TOKEN, PRODUCT_ID);
		await gateway.activate(ACCESS_TOKEN, PRODUCT_ID);

		expect(http.requests.map((request) => [request.path, request.responseSchema])).toEqual([
			[`/api/v1/products/${PRODUCT_ID}/deactivation`, null],
			[`/api/v1/products/${PRODUCT_ID}/activation`, null]
		]);
	});

	it('propaga los conflictos de la API', async () => {
		const http = new FakeHttpClient().failWith(
			new ConflictError('sku_already_in_use', "Ya existe un producto con el SKU 'CAF-250'.")
		);

		await expect(new HttpProductGateway(http).create(ACCESS_TOKEN, input)).rejects.toMatchObject({
			code: 'sku_already_in_use'
		});
	});
});

describe('HttpCategoryGateway', () => {
	it('lista, crea, renombra y elimina', async () => {
		const http = new FakeHttpClient();
		const gateway = new HttpCategoryGateway(http);

		http.respondWith({ items: [], page: 1, size: 100, totalElements: 100, totalPages: 1 });
		await gateway.list(ACCESS_TOKEN, { pageIndex: 1, size: 100 });
		http.respondWith({ id: CATEGORY_ID, name: 'Bebidas' });
		await gateway.create(ACCESS_TOKEN, 'Bebidas');
		await gateway.rename(ACCESS_TOKEN, CATEGORY_ID, 'Bebidas');
		await gateway.delete(ACCESS_TOKEN, CATEGORY_ID);

		expect(http.requests.map((request) => [request.method, request.path, request.body])).toEqual([
			['GET', '/api/v1/product-categories?page=1&size=100', undefined],
			['POST', '/api/v1/product-categories', { name: 'Bebidas' }],
			['PUT', `/api/v1/product-categories/${CATEGORY_ID}`, { name: 'Bebidas' }],
			['DELETE', `/api/v1/product-categories/${CATEGORY_ID}`, undefined]
		]);
	});
});
