import { z } from 'zod';
import type { Page } from '#lib/shared/pagination/page.ts';

/** Ningún listado de la API devuelve más de 100 elementos por página (`MAX_PAGE_SIZE`). */
const MAX_PAGE_ITEMS = 100;

/**
 * Contrato de `PageResponse<T>` del backend (`items`, `page`, `size`, `totalElements`,
 * `totalPages`), convertido a `Page<T>` con los elementos ya validados por `itemSchema`.
 */
export function pageResponseSchema<ItemSchema extends z.ZodType>(itemSchema: ItemSchema) {
	return z
		.object({
			items: z.array(itemSchema).max(MAX_PAGE_ITEMS),
			page: z.number().int().min(0),
			size: z.number().int().min(1),
			totalElements: z.number().int().min(0),
			totalPages: z.number().int().min(0)
		})
		.transform((response): Page<z.output<ItemSchema>> => ({
			items: response.items,
			pageIndex: response.page,
			size: response.size,
			totalElements: response.totalElements,
			totalPages: response.totalPages
		}));
}

/** Instante ISO-8601 de la API (`Instant`), convertido a `Date`. */
export const apiInstant = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

/** Importe o cantidad de la API (`BigDecimal`, serializado como número JSON). */
export const apiDecimal = z.number().finite().min(0);
