import type { Page, PageRequest } from '#lib/shared/pagination/page.ts';
import type { SaveProductInput } from '../application/dto/save-product-input';
import type { CategoryGateway, ProductGateway, ProductSearchCriteria } from '../application/ports';
import type { Category, Product } from '../domain/product';

/** Dobles en memoria de los puertos del catálogo, para tests sin red ni SvelteKit. */

export const ACCESS_TOKEN = 'access-token';

export function product(overrides: Partial<Product> = {}): Product {
	return {
		id: '10000000-0000-4000-8000-000000000001',
		sku: 'CAF-250',
		name: 'Café molido 250 g',
		description: null,
		type: 'GOODS',
		categoryId: null,
		listPrice: 35.5,
		taxRatePercent: 13,
		status: 'ACTIVE',
		createdAt: new Date('2026-01-01T12:00:00Z'),
		...overrides
	};
}

export function category(id: string, name: string): Category {
	return { id, name };
}

export function pageOf<T>(items: readonly T[], overrides: Partial<Page<T>> = {}): Page<T> {
	return {
		items,
		pageIndex: 0,
		size: 20,
		totalElements: items.length,
		totalPages: items.length === 0 ? 0 : 1,
		...overrides
	};
}

export class InMemoryCategoryGateway implements CategoryGateway {
	readonly requestedPages: PageRequest[] = [];

	constructor(private readonly categories: Category[] = []) {}

	async list(_accessToken: string, page: PageRequest): Promise<Page<Category>> {
		this.requestedPages.push(page);
		const start = page.pageIndex * page.size;
		return {
			items: this.categories.slice(start, start + page.size),
			pageIndex: page.pageIndex,
			size: page.size,
			totalElements: this.categories.length,
			totalPages: Math.ceil(this.categories.length / page.size)
		};
	}

	async create(_accessToken: string, name: string): Promise<Category> {
		const suffix = String(this.categories.length + 1).padStart(12, '0');
		const created = category(`20000000-0000-4000-8000-${suffix}`, name);
		this.categories.push(created);
		return created;
	}

	async rename(_accessToken: string, categoryId: string, name: string): Promise<Category> {
		return category(categoryId, name);
	}

	async delete(): Promise<void> {}
}

/** Gateway programable que registra las llamadas. */
export class StubProductGateway implements ProductGateway {
	readonly calls: { method: string; args: unknown[] }[] = [];
	page: Page<Product> = pageOf([]);
	current: Product = product();

	async list(accessToken: string, criteria: ProductSearchCriteria): Promise<Page<Product>> {
		this.calls.push({ method: 'list', args: [accessToken, criteria] });
		return this.page;
	}

	async get(accessToken: string, productId: string): Promise<Product> {
		this.calls.push({ method: 'get', args: [accessToken, productId] });
		return this.current;
	}

	async create(accessToken: string, input: SaveProductInput): Promise<Product> {
		this.calls.push({ method: 'create', args: [accessToken, input] });
		return this.current;
	}

	async update(accessToken: string, productId: string, input: SaveProductInput): Promise<Product> {
		this.calls.push({ method: 'update', args: [accessToken, productId, input] });
		return this.current;
	}

	async activate(accessToken: string, productId: string): Promise<void> {
		this.calls.push({ method: 'activate', args: [accessToken, productId] });
	}

	async deactivate(accessToken: string, productId: string): Promise<void> {
		this.calls.push({ method: 'deactivate', args: [accessToken, productId] });
	}
}
