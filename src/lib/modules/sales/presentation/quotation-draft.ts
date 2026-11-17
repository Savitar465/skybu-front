import type { CustomerOption, ProductOption } from '../application/dto/lookup-options';
import type { SalesOrder } from '../domain/sales-order';

/**
 * Estado editable del editor de cotizaciones, tal y como lo manipula la interfaz (textos sin
 * validar). Al enviarse, el servidor lo valida con `saveSalesOrderInputSchema`.
 */
export interface DraftLine {
	/** Clave estable para la lista (no se envía). */
	readonly key: string;
	product: ProductOption | null;
	quantity: string;
	discountPercent: string;
}

export interface QuotationDraft {
	customer: CustomerOption | null;
	validUntil: string;
	notes: string;
	lines: DraftLine[];
}

/**
 * Borrador vacío con una primera línea. Su clave es fija porque se renderiza en el servidor y
 * se hidrata en el navegador: una clave aleatoria daría ids distintos en cada lado.
 */
export function emptyDraft(): QuotationDraft {
	return { customer: null, validUntil: '', notes: '', lines: [newDraftLine('first')] };
}

/** Línea nueva. Las que se añaden en el navegador reciben una clave aleatoria. */
export function newDraftLine(key: string = crypto.randomUUID()): DraftLine {
	return { key, product: null, quantity: '1', discountPercent: '' };
}

/**
 * Borrador a partir de un documento guardado. El precio y el impuesto de cada línea son los
 * que se copiaron al guardarlo; al volver a guardar, la API aplica los vigentes del catálogo.
 */
export function draftFromOrder(order: SalesOrder): QuotationDraft {
	return {
		customer: { id: order.customerId, name: order.customerName, taxId: null },
		validUntil: order.validUntil,
		notes: order.notes ?? '',
		lines: order.lines.map((line) => ({
			key: line.id,
			product: {
				id: line.productId,
				sku: line.productSku,
				name: line.productName,
				listPrice: line.unitPrice,
				taxRatePercent: line.taxRatePercent
			},
			quantity: String(line.quantity),
			discountPercent: line.discountPercent === 0 ? '' : String(line.discountPercent)
		}))
	};
}
