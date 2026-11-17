import { describe, expect, it } from 'vitest';
import {
	ACCESS_TOKEN,
	InMemoryCategoryGateway,
	StubProductGateway,
	category,
	pageOf,
	product
} from '../../testing/fakes';
import { GetProductUseCase } from './get-product';
import { ListCategoriesUseCase } from './list-categories';
import { ListProductsUseCase, PRODUCT_PAGE_SIZE } from './list-products';
import {
	CreateProductUseCase,
	SetProductActiveUseCase,
	UpdateProductUseCase
} from './save-product';

const BEBIDAS = category('20000000-0000-4000-8000-000000000001', 'Bebidas');
const ABARROTES = category('20000000-0000-4000-8000-000000000002', 'Abarrotes');

const productInput = {
	sku: 'CAF-250',
	name: 'Café molido 250 g',
	description: null,
	type: 'GOODS' as const,
	categoryId: null,
	listPrice: 35.5,
	taxRatePercent: 13
};

describe('ListCategoriesUseCase', () => {
	it('recorre todas las páginas y ordena por nombre', async () => {
		const many = Array.from({ length: 150 }, (_, index) =>
			category(`20000000-0000-4000-8000-${String(index).padStart(12, '0')}`, `Cat ${index}`)
		);
		const gateway = new InMemoryCategoryGateway([...many, ABARROTES]);

		const categories = await new ListCategoriesUseCase(gateway).execute(ACCESS_TOKEN);

		expect(categories).toHaveLength(151);
		expect(categories[0]).toEqual(ABARROTES);
		expect(gateway.requestedPages).toEqual([
			{ pageIndex: 0, size: 100 },
			{ pageIndex: 1, size: 100 }
		]);
	});

	it('con una sola página hace una sola petición', async () => {
		const gateway = new InMemoryCategoryGateway([BEBIDAS]);

		await new ListCategoriesUseCase(gateway).execute(ACCESS_TOKEN);

		expect(gateway.requestedPages).toHaveLength(1);
	});
});

describe('ListProductsUseCase', () => {
	it('traduce los filtros y resuelve el nombre de la categoría de cada producto', async () => {
		const products = new StubProductGateway();
		products.page = pageOf([
			product({ categoryId: BEBIDAS.id }),
			product({ id: '10000000-0000-4000-8000-000000000002', categoryId: null }),
			product({ id: '10000000-0000-4000-8000-000000000003', categoryId: 'desconocida' })
		]);
		const useCase = new ListProductsUseCase(
			products,
			new ListCategoriesUseCase(new InMemoryCategoryGateway([BEBIDAS]))
		);

		const result = await useCase.execute(ACCESS_TOKEN, { search: '', inactive: true, page: 2 });

		expect(products.calls[0].args[1]).toEqual({
			search: null,
			includeInactive: true,
			page: { pageIndex: 1, size: PRODUCT_PAGE_SIZE }
		});
		expect(result.products.items.map((item) => item.categoryName)).toEqual(['Bebidas', null, null]);
		expect(result.categories).toEqual([BEBIDAS]);
	});
});

describe('casos de uso de producto', () => {
	it('GetProduct devuelve la ficha y las categorías para el formulario', async () => {
		const useCase = new GetProductUseCase(
			new StubProductGateway(),
			new ListCategoriesUseCase(new InMemoryCategoryGateway([BEBIDAS]))
		);

		expect(await useCase.execute(ACCESS_TOKEN, product().id)).toEqual({
			product: product(),
			categories: [BEBIDAS]
		});
	});

	it('crear y actualizar envían los datos validados', async () => {
		const gateway = new StubProductGateway();

		await new CreateProductUseCase(gateway).execute(ACCESS_TOKEN, productInput);
		await new UpdateProductUseCase(gateway).execute(ACCESS_TOKEN, product().id, productInput);

		expect(gateway.calls).toEqual([
			{ method: 'create', args: [ACCESS_TOKEN, productInput] },
			{ method: 'update', args: [ACCESS_TOKEN, product().id, productInput] }
		]);
	});

	it('activar y desactivar usan su operación', async () => {
		const gateway = new StubProductGateway();
		const useCase = new SetProductActiveUseCase(gateway);

		await useCase.execute(ACCESS_TOKEN, product().id, false);
		await useCase.execute(ACCESS_TOKEN, product().id, true);

		expect(gateway.calls.map((call) => call.method)).toEqual(['deactivate', 'activate']);
	});
});
