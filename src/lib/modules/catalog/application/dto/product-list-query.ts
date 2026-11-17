import { z } from 'zod';
import { pageNumberParam, searchParam } from '#lib/shared/validation/common-schemas.ts';
import { PRODUCT_SEARCH_MAX_LENGTH } from '../../domain/product';

/** Filtros del listado de productos leídos de la URL (`?search=&inactive=1&page=2`). */
export const productListQuerySchema = z.object({
	search: searchParam(PRODUCT_SEARCH_MAX_LENGTH),
	inactive: z
		.string()
		.optional()
		.transform((value) => value === '1')
		.catch(false),
	page: pageNumberParam
});

export type ProductListQuery = z.output<typeof productListQuerySchema>;
