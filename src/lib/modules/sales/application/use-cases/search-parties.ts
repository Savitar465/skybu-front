import type { CustomerOption, ProductOption } from '../dto/lookup-options';
import type { CustomerLookup, ProductLookup } from '../ports';

/** Resultados por búsqueda: suficientes para elegir, pocos para responder rápido al teclear. */
export const LOOKUP_RESULT_LIMIT = 10;

/** Busca clientes activos por nombre o NIT para asignarlos a una cotización. */
export class SearchCustomersUseCase {
	constructor(private readonly customerLookup: CustomerLookup) {}

	execute(accessToken: string, term: string): Promise<readonly CustomerOption[]> {
		return this.customerLookup.search(accessToken, term, LOOKUP_RESULT_LIMIT);
	}
}

/** Busca productos activos por nombre o SKU para añadirlos como líneas. */
export class SearchProductsUseCase {
	constructor(private readonly productLookup: ProductLookup) {}

	execute(accessToken: string, term: string): Promise<readonly ProductOption[]> {
		return this.productLookup.search(accessToken, term, LOOKUP_RESULT_LIMIT);
	}
}
