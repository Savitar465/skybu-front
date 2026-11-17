import { z } from 'zod';
import { pageNumberParam, searchParam } from '#lib/shared/validation/common-schemas.ts';
import { SALES_ORDER_STATUSES } from '../../domain/sales-order';

/** Filtros del listado de documentos leídos de la URL (`?status=SENT&page=2`). */
export const salesOrderListQuerySchema = z.object({
	status: z.enum(SALES_ORDER_STATUSES).optional().catch(undefined),
	page: pageNumberParam
});

export type SalesOrderListQuery = z.output<typeof salesOrderListQuerySchema>;

/** Las búsquedas de la API (clientes, productos) aceptan como máximo 100 caracteres. */
export const LOOKUP_SEARCH_MAX_LENGTH = 100;

/** Término de búsqueda de los selectores de cliente y producto (`?search=`). */
export const lookupQuerySchema = z.object({ search: searchParam(LOOKUP_SEARCH_MAX_LENGTH) });
