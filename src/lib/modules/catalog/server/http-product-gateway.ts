import { z } from 'zod';
import { apiPath, pathSegment } from '#lib/server/api/api-path.ts';
import { apiDecimal, apiInstant, pageResponseSchema } from '#lib/server/api/page-response.ts';
import type { HttpClient } from '#lib/server/http/http-client.ts';
import type { Page } from '#lib/shared/pagination/page.ts';
import type { SaveProductInput } from '../application/dto/save-product-input';
import type { ProductGateway, ProductSearchCriteria } from '../application/ports';
import {
	PRODUCT_DESCRIPTION_MAX_LENGTH,
	PRODUCT_NAME_MAX_LENGTH,
	PRODUCT_STATUSES,
	PRODUCT_TYPES,
	SKU_MAX_LENGTH,
	type Product
} from '../domain/product';

const BASE_PATH = '/api/v1/products';

/** Contrato de `ProductView` del backend. */
export const productViewSchema = z
	.object({
		id: z.uuid(),
		sku: z.string().min(1).max(SKU_MAX_LENGTH),
		name: z.string().min(1).max(PRODUCT_NAME_MAX_LENGTH),
		description: z.string().max(PRODUCT_DESCRIPTION_MAX_LENGTH).nullable(),
		type: z.enum(PRODUCT_TYPES),
		categoryId: z.uuid().nullable(),
		listPrice: apiDecimal,
		taxRatePercent: apiDecimal.max(100),
		status: z.enum(PRODUCT_STATUSES),
		createdAt: apiInstant
	})
	.transform((product): Product => product);

const productPageSchema = pageResponseSchema(productViewSchema);

/** Adaptador de `ProductGateway` sobre `/api/v1/products` (permisos `catalog:products:*`). */
export class HttpProductGateway implements ProductGateway {
	constructor(private readonly httpClient: HttpClient) {}

	list(accessToken: string, criteria: ProductSearchCriteria): Promise<Page<Product>> {
		return this.httpClient.send({
			method: 'GET',
			path: apiPath(BASE_PATH, {
				search: criteria.search,
				includeInactive: criteria.includeInactive,
				page: criteria.page.pageIndex,
				size: criteria.page.size
			}),
			accessToken,
			responseSchema: productPageSchema
		});
	}

	get(accessToken: string, productId: string): Promise<Product> {
		return this.httpClient.send({
			method: 'GET',
			path: `${BASE_PATH}/${pathSegment(productId)}`,
			accessToken,
			responseSchema: productViewSchema
		});
	}

	create(accessToken: string, input: SaveProductInput): Promise<Product> {
		return this.httpClient.send({
			method: 'POST',
			path: BASE_PATH,
			accessToken,
			body: toRequestBody(input),
			responseSchema: productViewSchema
		});
	}

	update(accessToken: string, productId: string, input: SaveProductInput): Promise<Product> {
		return this.httpClient.send({
			method: 'PUT',
			path: `${BASE_PATH}/${pathSegment(productId)}`,
			accessToken,
			body: toRequestBody(input),
			responseSchema: productViewSchema
		});
	}

	activate(accessToken: string, productId: string): Promise<void> {
		return this.httpClient.send({
			method: 'POST',
			path: `${BASE_PATH}/${pathSegment(productId)}/activation`,
			accessToken,
			responseSchema: null
		});
	}

	deactivate(accessToken: string, productId: string): Promise<void> {
		return this.httpClient.send({
			method: 'POST',
			path: `${BASE_PATH}/${pathSegment(productId)}/deactivation`,
			accessToken,
			responseSchema: null
		});
	}
}

/** Cuerpo de `SaveProductRequest`: se listan los campos uno a uno para no enviar nada de más. */
function toRequestBody(input: SaveProductInput) {
	return {
		sku: input.sku,
		name: input.name,
		description: input.description,
		type: input.type,
		categoryId: input.categoryId,
		listPrice: input.listPrice,
		taxRatePercent: input.taxRatePercent
	};
}
