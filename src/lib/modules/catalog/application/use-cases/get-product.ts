import type { Category, Product } from '../../domain/product';
import type { ProductGateway } from '../ports';
import type { ListCategoriesUseCase } from './list-categories';

export interface ProductDetail {
	readonly product: Product;
	/** Opciones para el selector de categoría del formulario de edición. */
	readonly categories: readonly Category[];
}

/** Ficha de un producto junto con las categorías disponibles para editarlo. */
export class GetProductUseCase {
	constructor(
		private readonly productGateway: ProductGateway,
		private readonly listCategories: ListCategoriesUseCase
	) {}

	async execute(accessToken: string, productId: string): Promise<ProductDetail> {
		const [product, categories] = await Promise.all([
			this.productGateway.get(accessToken, productId),
			this.listCategories.execute(accessToken)
		]);
		return { product, categories };
	}
}
