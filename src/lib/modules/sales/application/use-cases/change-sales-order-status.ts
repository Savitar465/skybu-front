import type { SalesOrder, SalesOrderTransition } from '../../domain/sales-order';
import type { SalesOrderGateway } from '../ports';

/**
 * Ejecuta una transición del ciclo de vida (enviar, reabrir, confirmar, cancelar).
 *
 * No se comprueba antes el estado con una lectura previa: sería una carrera (otro usuario puede
 * cambiarlo entre la lectura y la escritura) y la API ya lo valida de forma atómica con bloqueo
 * optimista. Un estado incompatible llega como `invalid_order_state`, una cotización vencida
 * como `quotation_expired` y una sin líneas como `order_without_lines`.
 */
export class ChangeSalesOrderStatusUseCase {
	constructor(private readonly salesOrderGateway: SalesOrderGateway) {}

	execute(
		accessToken: string,
		orderId: string,
		transition: SalesOrderTransition
	): Promise<SalesOrder> {
		return this.salesOrderGateway.transition(accessToken, orderId, transition);
	}
}
