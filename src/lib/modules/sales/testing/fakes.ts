import type { Clock } from '#lib/shared/time/clock.ts';
import type { Page } from '#lib/shared/pagination/page.ts';
import type { CustomerOption, ProductOption } from '../application/dto/lookup-options';
import type { SaveSalesOrderInput } from '../application/dto/save-sales-order-input';
import type {
	CustomerLookup,
	ProductLookup,
	SalesOrderCriteria,
	SalesOrderGateway
} from '../application/ports';
import type { SalesOrder, SalesOrderSummary, SalesOrderTransition } from '../domain/sales-order';

/** Dobles en memoria de los puertos de ventas, para tests sin red ni SvelteKit. */

export const ACCESS_TOKEN = 'access-token';
/** 15 de marzo de 2026 a mediodía (hora local): «hoy» en los tests. */
export const NOW = new Date(2026, 2, 15, 12, 0, 0);
export const TODAY = '2026-03-15';

export function fixedClock(at: Date = NOW): Clock {
	return { now: () => at };
}

export const ORDER_ID = '30000000-0000-4000-8000-000000000001';
export const CUSTOMER_ID = '40000000-0000-4000-8000-000000000001';
export const PRODUCT_ID = '50000000-0000-4000-8000-000000000001';

export function salesOrder(overrides: Partial<SalesOrder> = {}): SalesOrder {
	return {
		id: ORDER_ID,
		number: 'S00042',
		status: 'DRAFT',
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
				quantity: 2,
				unitPrice: 35.5,
				discountPercent: 0,
				taxRatePercent: 13,
				subtotal: 71,
				tax: 9.23,
				total: 80.23
			}
		],
		subtotal: 71,
		taxTotal: 9.23,
		total: 80.23,
		createdAt: new Date('2026-03-10T14:00:00Z'),
		sentAt: null,
		confirmedAt: null,
		cancelledAt: null,
		...overrides
	};
}

export function saveInput(overrides: Partial<SaveSalesOrderInput> = {}): SaveSalesOrderInput {
	return {
		customerId: CUSTOMER_ID,
		validUntil: null,
		notes: null,
		lines: [{ productId: PRODUCT_ID, quantity: 2, discountPercent: null }],
		...overrides
	};
}

/** Gateway programable que registra las llamadas. */
export class StubSalesOrderGateway implements SalesOrderGateway {
	readonly calls: { method: string; args: unknown[] }[] = [];
	page: Page<SalesOrderSummary> = {
		items: [],
		pageIndex: 0,
		size: 20,
		totalElements: 0,
		totalPages: 0
	};
	current: SalesOrder = salesOrder();

	async list(accessToken: string, criteria: SalesOrderCriteria): Promise<Page<SalesOrderSummary>> {
		this.calls.push({ method: 'list', args: [accessToken, criteria] });
		return this.page;
	}

	async get(accessToken: string, orderId: string): Promise<SalesOrder> {
		this.calls.push({ method: 'get', args: [accessToken, orderId] });
		return this.current;
	}

	async create(accessToken: string, input: SaveSalesOrderInput): Promise<SalesOrder> {
		this.calls.push({ method: 'create', args: [accessToken, input] });
		return this.current;
	}

	async update(accessToken: string, orderId: string, input: SaveSalesOrderInput) {
		this.calls.push({ method: 'update', args: [accessToken, orderId, input] });
		return this.current;
	}

	async transition(accessToken: string, orderId: string, transition: SalesOrderTransition) {
		this.calls.push({ method: 'transition', args: [accessToken, orderId, transition] });
		return this.current;
	}
}

export class StubCustomerLookup implements CustomerLookup {
	readonly searches: { term: string; limit: number }[] = [];
	constructor(private readonly results: readonly CustomerOption[] = []) {}

	async search(_accessToken: string, term: string, limit: number) {
		this.searches.push({ term, limit });
		return this.results;
	}
}

export class StubProductLookup implements ProductLookup {
	readonly searches: { term: string; limit: number }[] = [];
	constructor(private readonly results: readonly ProductOption[] = []) {}

	async search(_accessToken: string, term: string, limit: number) {
		this.searches.push({ term, limit });
		return this.results;
	}
}
