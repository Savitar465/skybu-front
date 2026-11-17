import { z } from 'zod';
import { SALES_ORDER_PAGE_SIZE } from '#lib/modules/sales/application/use-cases/list-sales-orders.ts';
import { salesUseCases } from '#lib/modules/sales/server/sales-module.ts';
import { withSession } from '#lib/modules/auth/server/session-guards.ts';
import { pageNumberParam } from '#lib/shared/validation/common-schemas.ts';
import { parseSearchParams } from '#lib/shared/validation/parse-query.ts';
import type { PageServerLoad } from './$types';

const ordersQuerySchema = z.object({ page: pageNumberParam });

/** Pedidos de venta: documentos confirmados. `sales:orders:read` lo exige el hook. */
export const load: PageServerLoad = (event) => {
	const query = parseSearchParams(event.url.searchParams, ordersQuerySchema);
	return withSession(event, async (session) => ({
		query,
		pageSize: SALES_ORDER_PAGE_SIZE,
		...(await salesUseCases.listSalesOrders.execute(session.accessToken, {
			status: 'CONFIRMED',
			page: query.page
		}))
	}));
};
