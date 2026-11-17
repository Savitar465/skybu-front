import type { BadgeTone } from '#lib/shared/ui/Badge.svelte';
import type { ProductStatus, ProductType } from '../domain/product';

/** Textos de la interfaz del catálogo para los valores que envía la API. */

export const PRODUCT_TYPE_LABELS: Readonly<Record<ProductType, string>> = {
	GOODS: 'Bien',
	SERVICE: 'Servicio'
};

export const PRODUCT_TYPE_DESCRIPTIONS: Readonly<Record<ProductType, string>> = {
	GOODS: 'Producto físico; controla existencias en inventario.',
	SERVICE: 'Trabajo o prestación; no tiene existencias.'
};

export const PRODUCT_STATUS_BADGES: Readonly<
	Record<ProductStatus, { label: string; tone: BadgeTone }>
> = {
	ACTIVE: { label: 'Activo', tone: 'success' },
	INACTIVE: { label: 'Inactivo', tone: 'neutral' }
};

/** Errores de negocio de la API que corresponden a un campo concreto del formulario. */
export const PRODUCT_ERROR_FIELDS: Readonly<Record<string, string>> = {
	sku_already_in_use: 'sku',
	invalid_sku: 'sku',
	unknown_category: 'categoryId'
};

export const CATEGORY_ERROR_FIELDS: Readonly<Record<string, string>> = {
	category_name_already_in_use: 'name'
};

/** Avisos tras redirigir (`?notice=`). Solo códigos conocidos: nunca se refleja texto de la URL. */
export const CATALOG_NOTICES: Readonly<Record<string, string>> = {
	created: 'Producto creado.'
};
