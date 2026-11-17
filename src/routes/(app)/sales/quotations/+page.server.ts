import { salesOrderListQuerySchema } from '#lib/modules/sales/application/dto/list-queries.ts';
import { SALES_ORDER_PAGE_SIZE } from '#lib/modules/sales/application/use-cases/list-sales-orders.ts';
import { salesUseCases } from '#lib/modules/sales/server/sales-module.ts';
import { withSession } from '#lib/modules/auth/server/session-guards.ts';
import { parseSearchParams } from '#lib/shared/validation/parse-query.ts';
import type { PageServerLoad } from './$types';

/**
 * Todos los documentos de venta, con filtro por estado (como el menú «Cotizaciones» de Odoo).
 * `sales:orders:read` lo exige el hook.
 */
export const load: PageServerLoad = (event) => {
	const query = parseSearchParams(event.url.searchParams, salesOrderListQuerySchema);
	return withSession(event, async (session) => ({
		query,
		pageSize: SALES_ORDER_PAGE_SIZE,
		...(await salesUseCases.listSalesOrders.execute(session.accessToken, {
			status: query.status ?? null,
			page: query.page
		}))
	}));
};
