import { json } from '@sveltejs/kit';
import { withSession } from '#lib/modules/auth/server/session-guards.ts';
import { lookupQuerySchema } from '#lib/modules/sales/application/dto/list-queries.ts';
import { salesUseCases } from '#lib/modules/sales/server/sales-module.ts';
import { parseSearchParams } from '#lib/shared/validation/parse-query.ts';
import type { RequestHandler } from './$types';

/**
 * Búsqueda de clientes para el editor de cotizaciones (`GET /api/sales/customers?search=`).
 * El hook exige `sales:orders:write`; la API además exige `customers:customers:read`.
 */
export const GET: RequestHandler = (event) => {
	const { search } = parseSearchParams(event.url.searchParams, lookupQuerySchema);
	return withSession(event, async (session) =>
		json(await salesUseCases.searchCustomers.execute(session.accessToken, search), {
			headers: { 'Cache-Control': 'private, no-store' }
		})
	);
};
