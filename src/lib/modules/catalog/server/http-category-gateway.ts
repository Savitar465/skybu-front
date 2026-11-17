import { z } from 'zod';
import { apiPath, pathSegment } from '#lib/server/api/api-path.ts';
import { pageResponseSchema } from '#lib/server/api/page-response.ts';
import type { HttpClient } from '#lib/server/http/http-client.ts';
import type { Page, PageRequest } from '#lib/shared/pagination/page.ts';
import type { CategoryGateway } from '../application/ports';
import { CATEGORY_NAME_MAX_LENGTH, type Category } from '../domain/product';

const BASE_PATH = '/api/v1/product-categories';

const categoryViewSchema = z
	.object({ id: z.uuid(), name: z.string().min(1).max(CATEGORY_NAME_MAX_LENGTH) })
	.transform((category): Category => category);

const categoryPageSchema = pageResponseSchema(categoryViewSchema);

/**
 * Adaptador de `CategoryGateway` sobre `/api/v1/product-categories`. Leer exige
 * `catalog:products:read`; crear, renombrar y eliminar, `catalog:categories:manage`.
 */
export class HttpCategoryGateway implements CategoryGateway {
	constructor(private readonly httpClient: HttpClient) {}

	list(accessToken: string, page: PageRequest): Promise<Page<Category>> {
		return this.httpClient.send({
			method: 'GET',
			path: apiPath(BASE_PATH, { page: page.pageIndex, size: page.size }),
			accessToken,
			responseSchema: categoryPageSchema
		});
	}

	create(accessToken: string, name: string): Promise<Category> {
		return this.httpClient.send({
			method: 'POST',
			path: BASE_PATH,
			accessToken,
			body: { name },
			responseSchema: categoryViewSchema
		});
	}

	rename(accessToken: string, categoryId: string, name: string): Promise<Category> {
		return this.httpClient.send({
			method: 'PUT',
			path: `${BASE_PATH}/${pathSegment(categoryId)}`,
			accessToken,
			body: { name },
			responseSchema: categoryViewSchema
		});
	}

	delete(accessToken: string, categoryId: string): Promise<void> {
		return this.httpClient.send({
			method: 'DELETE',
			path: `${BASE_PATH}/${pathSegment(categoryId)}`,
			accessToken,
			responseSchema: null
		});
	}
}
