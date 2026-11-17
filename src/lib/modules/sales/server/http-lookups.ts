import { z } from 'zod';
import { apiPath } from '#lib/server/api/api-path.ts';
import { apiDecimal, pageResponseSchema } from '#lib/server/api/page-response.ts';
import type { HttpClient } from '#lib/server/http/http-client.ts';
import type { CustomerOption, ProductOption } from '../application/dto/lookup-options';
import type { CustomerLookup, ProductLookup } from '../application/ports';

/**
 * Adaptadores de búsqueda sobre las API de clientes y catálogo. Solo se validan y conservan los
 * campos que el editor de cotizaciones necesita: el resto de la vista (correo, teléfono,
 * descripción...) se descarta aquí y nunca llega al navegador.
 *
 * Se piden solo registros activos (`includeInactive=false`): la API rechazaría una cotización
 * con un cliente o producto inactivo.
 */

const customerOptionSchema = z
	.object({ id: z.uuid(), name: z.string().max(150), taxId: z.string().max(30).nullable() })
	.transform((customer): CustomerOption => customer);

const productOptionSchema = z
	.object({
		id: z.uuid(),
		sku: z.string().max(40),
		name: z.string().max(150),
		listPrice: apiDecimal,
		taxRatePercent: apiDecimal.max(100)
	})
	.transform((product): ProductOption => product);

const customerPageSchema = pageResponseSchema(customerOptionSchema);
const productPageSchema = pageResponseSchema(productOptionSchema);

/** `GET /api/v1/customers` (exige `customers:customers:read`). */
export class HttpCustomerLookup implements CustomerLookup {
	constructor(private readonly httpClient: HttpClient) {}

	async search(
		accessToken: string,
		term: string,
		limit: number
	): Promise<readonly CustomerOption[]> {
		const page = await this.httpClient.send({
			method: 'GET',
			path: apiPath('/api/v1/customers', { search: term, includeInactive: false, size: limit }),
			accessToken,
			responseSchema: customerPageSchema
		});
		return page.items;
	}
}

/** `GET /api/v1/products` (exige `catalog:products:read`). */
export class HttpProductLookup implements ProductLookup {
	constructor(private readonly httpClient: HttpClient) {}

	async search(
		accessToken: string,
		term: string,
		limit: number
	): Promise<readonly ProductOption[]> {
		const page = await this.httpClient.send({
			method: 'GET',
			path: apiPath('/api/v1/products', { search: term, includeInactive: false, size: limit }),
			accessToken,
			responseSchema: productPageSchema
		});
		return page.items;
	}
}
