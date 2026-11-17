import { toPageRequest, type Page } from '#lib/shared/pagination/page.ts';
import { toLocalIsoDate } from '#lib/shared/time/iso-date.ts';
import type { Clock } from '#lib/shared/time/clock.ts';
import type { SalesOrderStatus, SalesOrderSummary } from '../../domain/sales-order';
import type { SalesOrderGateway } from '../ports';

export const SALES_ORDER_PAGE_SIZE = 20;

export interface SalesOrderListing {
	readonly orders: Page<SalesOrderSummary>;
	/** Fecha de hoy (`AAAA-MM-DD`), para marcar las cotizaciones vencidas. */
	readonly today: string;
}

/** Listado paginado de documentos de venta, del más reciente al más antiguo. */
export class ListSalesOrdersUseCase {
	constructor(
		private readonly salesOrderGateway: SalesOrderGateway,
		private readonly clock: Clock
	) {}

	async execute(
		accessToken: string,
		filter: { readonly status: SalesOrderStatus | null; readonly page: number }
	): Promise<SalesOrderListing> {
		const orders = await this.salesOrderGateway.list(accessToken, {
			status: filter.status,
			page: toPageRequest(filter.page, SALES_ORDER_PAGE_SIZE)
		});
		return { orders, today: toLocalIsoDate(this.clock.now()) };
	}
}
