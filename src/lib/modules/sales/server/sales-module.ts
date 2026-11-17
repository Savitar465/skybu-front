import { apiHttpClient } from '#lib/server/api/api-http-client.ts';
import { systemClock } from '#lib/shared/time/clock.ts';
import { ChangeSalesOrderStatusUseCase } from '../application/use-cases/change-sales-order-status';
import { GetSalesOrderUseCase } from '../application/use-cases/get-sales-order';
import { ListSalesOrdersUseCase } from '../application/use-cases/list-sales-orders';
import { SaveQuotationUseCase } from '../application/use-cases/save-quotation';
import {
	SearchCustomersUseCase,
	SearchProductsUseCase
} from '../application/use-cases/search-parties';
import { HttpCustomerLookup, HttpProductLookup } from './http-lookups';
import { HttpSalesOrderGateway } from './http-sales-order-gateway';

/**
 * Raíz de composición del módulo de ventas: el único lugar que conoce las implementaciones
 * concretas. Los adaptadores no guardan estado por usuario, así que se crean una vez por proceso.
 */
const salesOrderGateway = new HttpSalesOrderGateway(apiHttpClient);

export const salesUseCases = {
	listSalesOrders: new ListSalesOrdersUseCase(salesOrderGateway, systemClock),
	getSalesOrder: new GetSalesOrderUseCase(salesOrderGateway, systemClock),
	saveQuotation: new SaveQuotationUseCase(salesOrderGateway, systemClock),
	changeStatus: new ChangeSalesOrderStatusUseCase(salesOrderGateway),
	searchCustomers: new SearchCustomersUseCase(new HttpCustomerLookup(apiHttpClient)),
	searchProducts: new SearchProductsUseCase(new HttpProductLookup(apiHttpClient))
} as const;
