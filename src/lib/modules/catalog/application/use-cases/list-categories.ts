import type { Category } from '../../domain/product';
import type { CategoryGateway } from '../ports';

/** Tamaño máximo de página que admite la API para categorías. */
const CATEGORY_PAGE_SIZE = 100;
/**
 * Cota de páginas a recorrer (1000 categorías). Una empresa no debería tener tantas; si las
 * tuviera, se muestran las primeras en lugar de lanzar decenas de peticiones por pantalla.
 */
const MAX_CATEGORY_PAGES = 10;

/**
 * Devuelve todas las categorías de la empresa, ordenadas por nombre. Se usan como opciones de
 * un selector y para mostrar el nombre de la categoría en el listado de productos, así que se
 * necesitan completas y no paginadas.
 */
export class ListCategoriesUseCase {
	constructor(private readonly categoryGateway: CategoryGateway) {}

	async execute(accessToken: string): Promise<readonly Category[]> {
		const categories: Category[] = [];
		for (let pageIndex = 0; pageIndex < MAX_CATEGORY_PAGES; pageIndex++) {
			const page = await this.categoryGateway.list(accessToken, {
				pageIndex,
				size: CATEGORY_PAGE_SIZE
			});
			categories.push(...page.items);
			if (pageIndex >= page.totalPages - 1) {
				break;
			}
		}
		return categories.sort((a, b) => a.name.localeCompare(b.name, 'es'));
	}
}
