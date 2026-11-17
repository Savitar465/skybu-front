import type { Page, PageRequest } from '#lib/shared/pagination/page.ts';
import type { Category, Product } from '../domain/product';
import type { SaveProductInput } from './dto/save-product-input';

/**
 * Puertos de salida del catálogo. Los casos de uso dependen solo de estas interfaces; las
 * implementaciones HTTP viven en `server/` y en los tests se sustituyen por dobles en memoria.
 */

export interface ProductSearchCriteria {
	readonly search: string | null;
	readonly includeInactive: boolean;
	readonly page: PageRequest;
}

/** Productos de la empresa (`/api/v1/products`). */
export interface ProductGateway {
	list(accessToken: string, criteria: ProductSearchCriteria): Promise<Page<Product>>;
	get(accessToken: string, productId: string): Promise<Product>;
	create(accessToken: string, input: SaveProductInput): Promise<Product>;
	update(accessToken: string, productId: string, input: SaveProductInput): Promise<Product>;
	activate(accessToken: string, productId: string): Promise<void>;
	deactivate(accessToken: string, productId: string): Promise<void>;
}

/** Categorías de producto (`/api/v1/product-categories`). */
export interface CategoryGateway {
	list(accessToken: string, page: PageRequest): Promise<Page<Category>>;
	create(accessToken: string, name: string): Promise<Category>;
	rename(accessToken: string, categoryId: string, name: string): Promise<Category>;
	delete(accessToken: string, categoryId: string): Promise<void>;
}
