import { ValidationError } from '#lib/shared/errors/app-error.ts';
import { toLocalIsoDate } from '#lib/shared/time/iso-date.ts';
import type { Clock } from '#lib/shared/time/clock.ts';
import type { SalesOrder } from '../../domain/sales-order';
import type { SaveSalesOrderInput } from '../dto/save-sales-order-input';
import type { SalesOrderGateway } from '../ports';

/**
 * Crea una cotización en borrador o revisa una existente.
 *
 * Antes de llamar a la API se comprueba la única regla que depende de la fecha (la validez no
 * puede ser anterior a hoy) para señalarla junto al campo en lugar de como error genérico. El
 * resto (cliente inactivo, producto no vendible, tope de descuento, estado no editable) lo
 * decide la API y llega como `BusinessRuleError` con su código.
 */
export class SaveQuotationUseCase {
	constructor(
		private readonly salesOrderGateway: SalesOrderGateway,
		private readonly clock: Clock
	) {}

	async create(accessToken: string, input: SaveSalesOrderInput): Promise<SalesOrder> {
		this.ensureValidUntilNotInPast(input);
		return this.salesOrderGateway.create(accessToken, input);
	}

	async update(
		accessToken: string,
		orderId: string,
		input: SaveSalesOrderInput
	): Promise<SalesOrder> {
		this.ensureValidUntilNotInPast(input);
		return this.salesOrderGateway.update(accessToken, orderId, input);
	}

	/** Fecha de hoy (`AAAA-MM-DD`): mínimo del campo de validez en el formulario. */
	today(): string {
		return toLocalIsoDate(this.clock.now());
	}

	private ensureValidUntilNotInPast(input: SaveSalesOrderInput): void {
		if (input.validUntil !== null && input.validUntil < this.today()) {
			throw new ValidationError('Revisa los datos del formulario.', {
				validUntil: ['La fecha de validez no puede ser anterior a hoy.']
			});
		}
	}
}
