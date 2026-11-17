import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';
import { SearchFailedError } from '#lib/shared/ui/search-failed-error.ts';
import { withQuery } from '#lib/shared/ui/url.ts';
import type { CustomerOption, ProductOption } from '../application/dto/lookup-options';

/**
 * Búsquedas del editor de cotizaciones contra los endpoints del propio frontend (BFF). El
 * navegador nunca llama a la API de SkyBu: el servidor de SvelteKit añade la sesión y valida
 * la respuesta de la API antes de devolver solo los campos necesarios.
 */

export function searchCustomers(term: string): Promise<readonly CustomerOption[]> {
	return fetchOptions(resolve('/(app)/api/sales/customers'), term);
}

export function searchProducts(term: string): Promise<readonly ProductOption[]> {
	return fetchOptions(resolve('/(app)/api/sales/products'), term);
}

async function fetchOptions<Option>(
	path: ResolvedPathname,
	term: string
): Promise<readonly Option[]> {
	let response: Response;
	try {
		response = await fetch(withQuery(path, { search: term }), {
			headers: { Accept: 'application/json' }
		});
	} catch (error) {
		// `fetch` lanza TypeError ante fallos de red.
		if (error instanceof TypeError) {
			throw new SearchFailedError(null);
		}
		throw error;
	}
	// Con la sesión caducada el servidor redirige al login (HTML): también es un fallo de búsqueda.
	const isJson = response.headers.get('Content-Type')?.includes('application/json') ?? false;
	if (!response.ok || !isJson) {
		throw new SearchFailedError(response.status);
	}
	// La respuesta la genera nuestro propio servidor a partir de datos ya validados con Zod.
	return (await response.json()) as readonly Option[];
}
