import { z } from 'zod';
import { apiPath, pathSegment } from '#lib/server/api/api-path.ts';
import { apiDecimal, apiInstant, pageResponseSchema } from '#lib/server/api/page-response.ts';
import type { HttpClient } from '#lib/server/http/http-client.ts';
import type { Page } from '#lib/shared/pagination/page.ts';
import type { SaveSalesOrderInput } from '../application/dto/save-sales-order-input';
import type { SalesOrderCriteria, SalesOrderGateway } from '../application/ports';
import {
	MAX_NOTES_LENGTH,
	MAX_ORDER_LINES,
	SALES_ORDER_STATUSES,
	type SalesOrder,
	type SalesOrderSummary,
	type SalesOrderTransition
} from '../domain/sales-order';

const BASE_PATH = '/api/v1/sales-orders';

/** Subrecurso de la API para cada transición (`POST /sales-orders/{id}/<subrecurso>`). */
const TRANSITION_RESOURCES: Readonly<Record<SalesOrderTransition, string>> = {
	send: 'sending',
	reopen: 'reopening',
	confirm: 'confirmation',
	cancel: 'cancellation'
};

const nullableInstant = apiInstant.nullable();

/** Campos comunes de `SalesOrderSummaryView` y `SalesOrderView`. */
const headerFields = {
	id: z.uuid(),
	number: z.string().min(1).max(20),
	status: z.enum(SALES_ORDER_STATUSES),
	customerId: z.uuid(),
	customerName: z.string().max(150),
	salespersonId: z.uuid(),
	currency: z.string().regex(/^[A-Z]{3}$/),
	validUntil: z.iso.date(),
	total: apiDecimal,
	createdAt: apiInstant
};

const summaryViewSchema = z.object(headerFields).transform((summary): SalesOrderSummary => summary);

const lineViewSchema = z.object({
	id: z.uuid(),
	lineNumber: z.number().int().min(1),
	productId: z.uuid(),
	productSku: z.string().max(40),
	productName: z.string().max(150),
	quantity: apiDecimal,
	unitPrice: apiDecimal,
	discountPercent: apiDecimal.max(100),
	taxRatePercent: apiDecimal.max(100),
	subtotal: apiDecimal,
	tax: apiDecimal,
	total: apiDecimal
});

/** Contrato de `SalesOrderView` del backend. */
export const salesOrderViewSchema = z
	.object({
		...headerFields,
		notes: z.string().max(MAX_NOTES_LENGTH).nullable(),
		lines: z.array(lineViewSchema).max(MAX_ORDER_LINES),
		subtotal: apiDecimal,
		taxTotal: apiDecimal,
		sentAt: nullableInstant,
		confirmedAt: nullableInstant,
		cancelledAt: nullableInstant
	})
	.transform((order): SalesOrder => order);

const summaryPageSchema = pageResponseSchema(summaryViewSchema);

/** Adaptador de `SalesOrderGateway` sobre `/api/v1/sales-orders` (permisos `sales:orders:*`). */
export class HttpSalesOrderGateway implements SalesOrderGateway {
	constructor(private readonly httpClient: HttpClient) {}

	list(accessToken: string, criteria: SalesOrderCriteria): Promise<Page<SalesOrderSummary>> {
		return this.httpClient.send({
			method: 'GET',
			path: apiPath(BASE_PATH, {
				status: criteria.status,
				page: criteria.page.pageIndex,
				size: criteria.page.size
			}),
			accessToken,
			responseSchema: summaryPageSchema
		});
	}

	get(accessToken: string, orderId: string): Promise<SalesOrder> {
		return this.httpClient.send({
			method: 'GET',
			path: orderPath(orderId),
			accessToken,
			responseSchema: salesOrderViewSchema
		});
	}

	create(accessToken: string, input: SaveSalesOrderInput): Promise<SalesOrder> {
		return this.httpClient.send({
			method: 'POST',
			path: BASE_PATH,
			accessToken,
			body: toRequestBody(input),
			responseSchema: salesOrderViewSchema
		});
	}

	update(accessToken: string, orderId: string, input: SaveSalesOrderInput): Promise<SalesOrder> {
		return this.httpClient.send({
			method: 'PUT',
			path: orderPath(orderId),
			accessToken,
			body: toRequestBody(input),
			responseSchema: salesOrderViewSchema
		});
	}

	transition(
		accessToken: string,
		orderId: string,
		transition: SalesOrderTransition
	): Promise<SalesOrder> {
		return this.httpClient.send({
			method: 'POST',
			path: `${orderPath(orderId)}/${TRANSITION_RESOURCES[transition]}`,
			accessToken,
			responseSchema: salesOrderViewSchema
		});
	}
}

function orderPath(orderId: string): string {
	return `${BASE_PATH}/${pathSegment(orderId)}`;
}

/** Cuerpo de `SaveSalesOrderRequest`: campo a campo, sin precio ni impuesto (los fija la API). */
function toRequestBody(input: SaveSalesOrderInput) {
	return {
		customerId: input.customerId,
		validUntil: input.validUntil,
		notes: input.notes,
		lines: input.lines.map((line) => ({
			productId: line.productId,
			quantity: line.quantity,
			discountPercent: line.discountPercent
		}))
	};
}
