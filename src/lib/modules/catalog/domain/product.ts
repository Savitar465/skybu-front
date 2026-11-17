/**
 * Modelo del catálogo tal y como lo expone la API (`ProductView`, `CategoryView`). El frontend
 * no decide precios ni impuestos: los muestra y los envía; las invariantes las garantiza el
 * backend. Aquí se replican los límites para dar feedback inmediato en los formularios.
 */

export const PRODUCT_TYPES = ['GOODS', 'SERVICE'] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const PRODUCT_STATUSES = ['ACTIVE', 'INACTIVE'] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export interface Product {
	readonly id: string;
	readonly sku: string;
	readonly name: string;
	readonly description: string | null;
	readonly type: ProductType;
	readonly categoryId: string | null;
	/** Precio de lista sin impuestos, en la moneda del sistema. */
	readonly listPrice: number;
	/** Tasa de impuesto de 0 a 100. */
	readonly taxRatePercent: number;
	readonly status: ProductStatus;
	readonly createdAt: Date;
}

export interface Category {
	readonly id: string;
	readonly name: string;
}

/** Fila del listado de productos: el producto con el nombre de su categoría ya resuelto. */
export interface ProductListItem extends Product {
	readonly categoryName: string | null;
}

/** Límites del backend (`Sku`, `ProductDetails`, `SaveCategoryRequest`). */
export const SKU_MAX_LENGTH = 40;
export const PRODUCT_NAME_MAX_LENGTH = 150;
export const PRODUCT_DESCRIPTION_MAX_LENGTH = 1000;
export const CATEGORY_NAME_MAX_LENGTH = 80;
export const MAX_LIST_PRICE = 999_999_999_999.99;
export const PRODUCT_SEARCH_MAX_LENGTH = 100;

/**
 * Formato del SKU una vez normalizado (sin espacios y en mayúsculas): letras, dígitos, punto,
 * guion, guion bajo o barra, empezando por letra o dígito.
 */
export const SKU_PATTERN = /^[A-Z0-9][A-Z0-9._/-]*$/;

export function isActive(product: Pick<Product, 'status'>): boolean {
	return product.status === 'ACTIVE';
}
