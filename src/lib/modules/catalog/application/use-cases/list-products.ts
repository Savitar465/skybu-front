import { mapPage, toPageRequest, type Page } from '#lib/shared/pagination/page.ts';
import type { Category, ProductListItem } from '../../domain/product';
import type { ProductListQuery } from '../dto/product-list-query';
import type { ProductGateway } from '../ports';
import type { ListCategoriesUseCase } from './list-categories';

export const PRODUCT_PAGE_SIZE = 20;

export interface ProductCatalogPage {
	readonly products: Page<ProductListItem>;
	readonly categories: readonly Category[];
}

/**
 * Listado paginado de productos con el nombre de su categoría. Productos y categorías se piden
 * en paralelo: la API devuelve solo el `categoryId` de cada producto.
 */
export class ListProductsUseCase {
	constructor(
		private readonly productGateway: ProductGateway,
		private readonly listCategories: ListCategoriesUseCase
	) {}

	async execute(accessToken: string, query: ProductListQuery): Promise<ProductCatalogPage> {
		const [products, categories] = await Promise.all([
			this.productGateway.list(accessToken, {
				search: query.search || null,
				includeInactive: query.inactive,
				page: toPageRequest(query.page, PRODUCT_PAGE_SIZE)
			}),
			this.listCategories.execute(accessToken)
		]);
		const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
		return {
			products: mapPage(products, (product) => ({
				...product,
				categoryName: product.categoryId ? (categoryNames.get(product.categoryId) ?? null) : null
			})),
			categories
		};
	}
}
