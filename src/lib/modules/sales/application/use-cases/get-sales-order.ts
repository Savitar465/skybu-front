import { toLocalIsoDate } from '#lib/shared/time/iso-date.ts';
import type { Clock } from '#lib/shared/time/clock.ts';
import type { SalesOrder } from '../../domain/sales-order';
import type { SalesOrderGateway } from '../ports';

export interface SalesOrderDetail {
	readonly order: SalesOrder;
	/** Fecha de hoy (`AAAA-MM-DD`): decide si la cotización ha vencido. */
	readonly today: string;
}

/** Detalle de un documento de venta. Uno de otra empresa responde 404, igual que uno inexistente. */
export class GetSalesOrderUseCase {
	constructor(
		private readonly salesOrderGateway: SalesOrderGateway,
		private readonly clock: Clock
	) {}

	async execute(accessToken: string, orderId: string): Promise<SalesOrderDetail> {
		const order = await this.salesOrderGateway.get(accessToken, orderId);
		return { order, today: toLocalIsoDate(this.clock.now()) };
	}
}
