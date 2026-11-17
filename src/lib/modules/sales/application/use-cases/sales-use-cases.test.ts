import { describe, expect, it } from 'vitest';
import { BusinessRuleError, ValidationError } from '#lib/shared/errors/app-error.ts';
import {
	ACCESS_TOKEN,
	ORDER_ID,
	StubCustomerLookup,
	StubProductLookup,
	StubSalesOrderGateway,
	TODAY,
	fixedClock,
	saveInput,
	salesOrder
} from '../../testing/fakes';
import { ChangeSalesOrderStatusUseCase } from './change-sales-order-status';
import { GetSalesOrderUseCase } from './get-sales-order';
import { ListSalesOrdersUseCase, SALES_ORDER_PAGE_SIZE } from './list-sales-orders';
import { SaveQuotationUseCase } from './save-quotation';
import {
	LOOKUP_RESULT_LIMIT,
	SearchCustomersUseCase,
	SearchProductsUseCase
} from './search-parties';

describe('ListSalesOrdersUseCase', () => {
	it('pide la página visible a la API (que empieza en 0) e incluye la fecha de hoy', async () => {
		const gateway = new StubSalesOrderGateway();
		const useCase = new ListSalesOrdersUseCase(gateway, fixedClock());

		const listing = await useCase.execute(ACCESS_TOKEN, { status: 'SENT', page: 3 });

		expect(gateway.calls[0].args).toEqual([
			ACCESS_TOKEN,
			{ status: 'SENT', page: { pageIndex: 2, size: SALES_ORDER_PAGE_SIZE } }
		]);
		expect(listing.today).toBe(TODAY);
	});
});

describe('GetSalesOrderUseCase', () => {
	it('devuelve el documento con la fecha de hoy para evaluar su vencimiento', async () => {
		const gateway = new StubSalesOrderGateway();

		const detail = await new GetSalesOrderUseCase(gateway, fixedClock()).execute(
			ACCESS_TOKEN,
			ORDER_ID
		);

		expect(detail).toEqual({ order: salesOrder(), today: TODAY });
	});
});

describe('SaveQuotationUseCase', () => {
	it('crea la cotización con los datos del formulario', async () => {
		const gateway = new StubSalesOrderGateway();
		const input = saveInput({ validUntil: TODAY });

		const created = await new SaveQuotationUseCase(gateway, fixedClock()).create(
			ACCESS_TOKEN,
			input
		);

		expect(created).toEqual(salesOrder());
		expect(gateway.calls).toEqual([{ method: 'create', args: [ACCESS_TOKEN, input] }]);
	});

	it('sin fecha de validez deja que la API aplique la de la empresa', async () => {
		const gateway = new StubSalesOrderGateway();

		await new SaveQuotationUseCase(gateway, fixedClock()).update(
			ACCESS_TOKEN,
			ORDER_ID,
			saveInput()
		);

		expect(gateway.calls[0].method).toBe('update');
	});

	it('rechaza una validez anterior a hoy junto al campo, sin llamar a la API', async () => {
		const gateway = new StubSalesOrderGateway();
		const useCase = new SaveQuotationUseCase(gateway, fixedClock());

		const attempt = useCase.create(ACCESS_TOKEN, saveInput({ validUntil: '2026-03-14' }));

		await expect(attempt).rejects.toBeInstanceOf(ValidationError);
		await expect(attempt).rejects.toMatchObject({
			fieldErrors: { validUntil: ['La fecha de validez no puede ser anterior a hoy.'] }
		});
		expect(gateway.calls).toHaveLength(0);
	});
});

describe('ChangeSalesOrderStatusUseCase', () => {
	it('delega la transición en la API', async () => {
		const gateway = new StubSalesOrderGateway();

		await new ChangeSalesOrderStatusUseCase(gateway).execute(ACCESS_TOKEN, ORDER_ID, 'confirm');

		expect(gateway.calls).toEqual([
			{ method: 'transition', args: [ACCESS_TOKEN, ORDER_ID, 'confirm'] }
		]);
	});

	it('propaga las reglas de negocio que decide la API', async () => {
		const gateway = new StubSalesOrderGateway();
		gateway.transition = () =>
			Promise.reject(new BusinessRuleError('quotation_expired', 'La cotización venció.'));

		await expect(
			new ChangeSalesOrderStatusUseCase(gateway).execute(ACCESS_TOKEN, ORDER_ID, 'confirm')
		).rejects.toMatchObject({ code: 'quotation_expired' });
	});
});

describe('búsquedas del editor', () => {
	it('limitan el número de resultados', async () => {
		const customers = new StubCustomerLookup();
		const products = new StubProductLookup();

		await new SearchCustomersUseCase(customers).execute(ACCESS_TOKEN, 'andina');
		await new SearchProductsUseCase(products).execute(ACCESS_TOKEN, 'caf');

		expect(customers.searches).toEqual([{ term: 'andina', limit: LOOKUP_RESULT_LIMIT }]);
		expect(products.searches).toEqual([{ term: 'caf', limit: LOOKUP_RESULT_LIMIT }]);
	});
});
