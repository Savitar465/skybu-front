import { productListQuerySchema } from '#lib/modules/catalog/application/dto/product-list-query.ts';
import { PRODUCT_PAGE_SIZE } from '#lib/modules/catalog/application/use-cases/list-products.ts';
import { catalogUseCases } from '#lib/modules/catalog/server/catalog-module.ts';
import { withSession } from '#lib/modules/auth/server/session-guards.ts';
import { parseSearchParams } from '#lib/shared/validation/parse-query.ts';
import type { PageServerLoad } from './$types';

/** `catalog:products:read` lo exige el hook (ver `ROUTE_PERMISSION_RULES`). */
export const load: PageServerLoad = (event) => {
	const query = parseSearchParams(event.url.searchParams, productListQuerySchema);
	return withSession(event, async (session) => ({
		query,
		pageSize: PRODUCT_PAGE_SIZE,
		...(await catalogUseCases.listProducts.execute(session.accessToken, query))
	}));
};
