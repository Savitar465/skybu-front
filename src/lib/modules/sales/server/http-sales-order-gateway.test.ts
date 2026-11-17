import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { FakeHttpClient } from '#lib/server/testing/fake-http-client.ts';
import { ACCESS_TOKEN, CUSTOMER_ID, ORDER_ID, PRODUCT_ID, saveInput } from '../testing/fakes';
import { HttpCustomerLookup, HttpProductLookup } from './http-lookups';
import { HttpSalesOrderGateway } from './http-sales-order-gateway';

/** Respuesta real de `SalesOrderView` (números como JSON, fechas ISO, nulos explícitos). */
const salesOrderView = {
	id: ORDER_ID,
	number: 'S00042',
	status: 'SENT',
	customerId: CUSTOMER_ID,
	customerName: 'Comercial Andina SRL',
	salespersonId: '60000000-0000-4000-8000-000000000001',
	currency: 'BOB',
	validUntil: '2026-04-14',
	notes: null,
	lines: [
		{
			id: '70000000-0000-4000-8000-000000000001',
			lineNumber: 1,
			productId: PRODUCT_ID,
			productSku: 'CAF-250',
			productName: 'Café molido 250 g',
			quantity: 2.0,
			unitPrice: 35.5,
			discountPercent: 0.0,
			taxRatePercent: 13.0,
			subtotal: 71.0,
			tax: 9.23,
			total: 80.23
		}
	],
	subtotal: 71.0,
	taxTotal: 9.23,
	total: 80.23,
	createdAt: '2026-03-10T14:00:00Z',
	sentAt: '2026-03-11T09:30:00.123456Z',
	confirmedAt: null,
	cancelledAt: null
};

const pageOf = (items: unknown[]) => ({
	items,
	page: 0,
	size: 10,
	totalElements: items.length,
	totalPages: 1
});

describe('HttpSalesOrderGateway', () => {
	it('lista con filtro y paginación, convirtiendo la respuesta a Page', async () => {
		const http = new FakeHttpClient().respondWith({ ...pageOf([salesOrderView]), size: 20 });
		const gateway = new HttpSalesOrderGateway(http);

		const page = await gateway.list(ACCESS_TOKEN, {
			status: 'SENT',
			page: { pageIndex: 1, size: 20 }
		});

		expect(http.lastRequest).toMatchObject({
			method: 'GET',
			path: '/api/v1/sales-orders?status=SENT&page=1&size=20',
			accessToken: ACCESS_TOKEN
		});
		expect(page.items[0]).toMatchObject({ number: 'S00042', total: 80.23 });
		expect(page.items[0].createdAt).toEqual(new Date('2026-03-10T14:00:00Z'));
	});

	it('sin filtro de estado no envía el parámetro', async () => {
		const http = new FakeHttpClient().respondWith(pageOf([]));

		await new HttpSalesOrderGateway(http).list(ACCESS_TOKEN, {
			status: null,
			page: { pageIndex: 0, size: 20 }
		});

		expect(http.lastRequest.path).toBe('/api/v1/sales-orders?page=0&size=20');
	});

	it('valida el detalle y convierte las fechas', async () => {
		const http = new FakeHttpClient().respondWith(salesOrderView);

		const order = await new HttpSalesOrderGateway(http).get(ACCESS_TOKEN, ORDER_ID);

		expect(order.sentAt).toEqual(new Date('2026-03-11T09:30:00.123456Z'));
		expect(order.confirmedAt).toBeNull();
		expect(order.lines).toHaveLength(1);
	});

	it('rechaza una respuesta que no cumple el contrato', async () => {
		const http = new FakeHttpClient().respondWith({ ...salesOrderView, status: 'ARCHIVED' });

		await expect(
			new HttpSalesOrderGateway(http).get(ACCESS_TOKEN, ORDER_ID)
		).rejects.toBeInstanceOf(ZodError);
	});

	it('envía solo producto, cantidad y descuento de cada línea (nunca precio ni impuesto)', async () => {
		const http = new FakeHttpClient().respondWith(salesOrderView);
		const input = saveInput({ notes: 'Urgente' });

		await new HttpSalesOrderGateway(http).create(ACCESS_TOKEN, input);

		expect(http.lastRequest).toMatchObject({ method: 'POST', path: '/api/v1/sales-orders' });
		expect(http.lastRequest.body).toEqual({
			customerId: CUSTOMER_ID,
			validUntil: null,
			notes: 'Urgente',
			lines: [{ productId: PRODUCT_ID, quantity: 2, discountPercent: null }]
		});
	});

	it.each([
		['send', 'sending'],
		['reopen', 'reopening'],
		['confirm', 'confirmation'],
		['cancel', 'cancellation']
	] as const)('la transición %s usa el subrecurso /%s', async (transition, resource) => {
		const http = new FakeHttpClient().respondWith(salesOrderView);

		await new HttpSalesOrderGateway(http).transition(ACCESS_TOKEN, ORDER_ID, transition);

		expect(http.lastRequest).toMatchObject({
			method: 'POST',
			path: `/api/v1/sales-orders/${ORDER_ID}/${resource}`
		});
	});
});

describe('búsquedas de clientes y productos', () => {
	it('piden solo activos y descartan los campos que el editor no necesita', async () => {
		const http = new FakeHttpClient().respondWith(
			pageOf([
				{
					id: CUSTOMER_ID,
					name: 'Comercial Andina SRL',
					taxId: '1020304050',
					email: 'compras@andina.test',
					phone: '+591 2 2222222',
					address: 'Av. Arce 123',
					status: 'ACTIVE',
					createdAt: '2026-01-01T00:00:00Z'
				}
			])
		);

		const customers = await new HttpCustomerLookup(http).search(ACCESS_TOKEN, 'andina sa', 10);

		expect(http.lastRequest.path).toBe(
			'/api/v1/customers?search=andina%20sa&includeInactive=false&size=10'
		);
		expect(customers).toEqual([
			{ id: CUSTOMER_ID, name: 'Comercial Andina SRL', taxId: '1020304050' }
		]);
	});

	it('los productos incluyen precio e impuesto para la vista previa', async () => {
		const http = new FakeHttpClient().respondWith(
			pageOf([
				{
					id: PRODUCT_ID,
					sku: 'CAF-250',
					name: 'Café molido 250 g',
					description: 'Tostado medio',
					type: 'GOODS',
					categoryId: null,
					listPrice: 35.5,
					taxRatePercent: 13,
					status: 'ACTIVE',
					createdAt: '2026-01-01T00:00:00Z'
				}
			])
		);

		const products = await new HttpProductLookup(http).search(ACCESS_TOKEN, '', 10);

		expect(http.lastRequest.path).toBe('/api/v1/products?includeInactive=false&size=10');
		expect(products).toEqual([
			{
				id: PRODUCT_ID,
				sku: 'CAF-250',
				name: 'Café molido 250 g',
				listPrice: 35.5,
				taxRatePercent: 13
			}
		]);
	});
});
