import type { Page, PageRequest } from '#lib/shared/pagination/page.ts';
import type {
	SalesOrder,
	SalesOrderStatus,
	SalesOrderSummary,
	SalesOrderTransition
} from '../domain/sales-order';
import type { CustomerOption, ProductOption } from './dto/lookup-options';
import type { SaveSalesOrderInput } from './dto/save-sales-order-input';

/**
 * Puertos de salida del módulo de ventas. Los casos de uso dependen solo de estas interfaces;
 * las implementaciones HTTP viven en `server/` y en los tests se sustituyen por dobles.
 */

export interface SalesOrderCriteria {
	/** `null` = todos los estados. */
	readonly status: SalesOrderStatus | null;
	readonly page: PageRequest;
}

/** Cotizaciones y pedidos (`/api/v1/sales-orders`). */
export interface SalesOrderGateway {
	list(accessToken: string, criteria: SalesOrderCriteria): Promise<Page<SalesOrderSummary>>;
	get(accessToken: string, orderId: string): Promise<SalesOrder>;
	create(accessToken: string, input: SaveSalesOrderInput): Promise<SalesOrder>;
	update(accessToken: string, orderId: string, input: SaveSalesOrderInput): Promise<SalesOrder>;
	transition(
		accessToken: string,
		orderId: string,
		transition: SalesOrderTransition
	): Promise<SalesOrder>;
}

/** Búsqueda de clientes activos a los que se puede cotizar. */
export interface CustomerLookup {
	search(accessToken: string, term: string, limit: number): Promise<readonly CustomerOption[]>;
}

/** Búsqueda de productos activos (vendibles) del catálogo. */
export interface ProductLookup {
	search(accessToken: string, term: string, limit: number): Promise<readonly ProductOption[]>;
}
