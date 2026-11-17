import { apiHttpClient } from '#lib/server/api/api-http-client.ts';
import { GetProductUseCase } from '../application/use-cases/get-product';
import { ListCategoriesUseCase } from '../application/use-cases/list-categories';
import { ListProductsUseCase } from '../application/use-cases/list-products';
import {
	CreateCategoryUseCase,
	DeleteCategoryUseCase,
	RenameCategoryUseCase
} from '../application/use-cases/manage-categories';
import {
	CreateProductUseCase,
	SetProductActiveUseCase,
	UpdateProductUseCase
} from '../application/use-cases/save-product';
import { HttpCategoryGateway } from './http-category-gateway';
import { HttpProductGateway } from './http-product-gateway';

/**
 * Raíz de composición del catálogo: el único lugar que conoce las implementaciones concretas.
 * Ningún adaptador guarda estado por usuario (el token viaja en cada llamada), así que los
 * casos de uso se crean una sola vez por proceso.
 */
const productGateway = new HttpProductGateway(apiHttpClient);
const categoryGateway = new HttpCategoryGateway(apiHttpClient);
const listCategories = new ListCategoriesUseCase(categoryGateway);

export const catalogUseCases = {
	listProducts: new ListProductsUseCase(productGateway, listCategories),
	getProduct: new GetProductUseCase(productGateway, listCategories),
	createProduct: new CreateProductUseCase(productGateway),
	updateProduct: new UpdateProductUseCase(productGateway),
	setProductActive: new SetProductActiveUseCase(productGateway),
	listCategories,
	createCategory: new CreateCategoryUseCase(categoryGateway),
	renameCategory: new RenameCategoryUseCase(categoryGateway),
	deleteCategory: new DeleteCategoryUseCase(categoryGateway)
} as const;
