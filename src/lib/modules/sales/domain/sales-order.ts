/**
 * Documento de venta (modelo de Odoo): una cotización que, al confirmarse, se convierte en
 * pedido de venta conservando su número. Réplica de las reglas de `SalesOrder` del backend,
 * que es quien las aplica de verdad; aquí sirven para mostrar solo las acciones posibles y
 * explicar por qué una acción no está disponible.
 *
 * ```
 *   DRAFT ──send──▶ SENT ──confirm──▶ CONFIRMED
 *     ▲──reopen─────┘
 *   DRAFT ──confirm──▶ CONFIRMED                  (venta directa)
 *   DRAFT | SENT | CONFIRMED ──cancel──▶ CANCELLED (estado final)
 * ```
 */

export const SALES_ORDER_STATUSES = ['DRAFT', 'SENT', 'CONFIRMED', 'CANCELLED'] as const;
export type SalesOrderStatus = (typeof SALES_ORDER_STATUSES)[number];

export const SALES_ORDER_TRANSITIONS = ['send', 'reopen', 'confirm', 'cancel'] as const;
export type SalesOrderTransition = (typeof SALES_ORDER_TRANSITIONS)[number];

export interface SalesOrderLine {
	readonly id: string;
	readonly lineNumber: number;
	readonly productId: string;
	readonly productSku: string;
	readonly productName: string;
	readonly quantity: number;
	/** Precio unitario sin impuestos, copiado del catálogo al guardar la cotización. */
	readonly unitPrice: number;
	readonly discountPercent: number;
	readonly taxRatePercent: number;
	readonly subtotal: number;
	readonly tax: number;
	readonly total: number;
}

/** Cabecera de un documento, tal y como aparece en los listados. */
export interface SalesOrderSummary {
	readonly id: string;
	readonly number: string;
	readonly status: SalesOrderStatus;
	readonly customerId: string;
	readonly customerName: string;
	readonly salespersonId: string;
	readonly currency: string;
	/** Último día (inclusive) en que la cotización puede confirmarse, `AAAA-MM-DD`. */
	readonly validUntil: string;
	readonly total: number;
	readonly createdAt: Date;
}

export interface SalesOrder extends SalesOrderSummary {
	readonly notes: string | null;
	readonly lines: readonly SalesOrderLine[];
	readonly subtotal: number;
	readonly taxTotal: number;
	readonly sentAt: Date | null;
	readonly confirmedAt: Date | null;
	readonly cancelledAt: Date | null;
}

/** Límites del backend (`OrderContent`, `SaveSalesOrderRequest`). */
export const MAX_ORDER_LINES = 200;
export const MAX_NOTES_LENGTH = 1000;
export const MAX_LINE_QUANTITY = 999_999_999.999;

const TRANSITIONS_BY_STATUS: Readonly<Record<SalesOrderStatus, readonly SalesOrderTransition[]>> = {
	DRAFT: ['send', 'confirm', 'cancel'],
	SENT: ['reopen', 'confirm', 'cancel'],
	CONFIRMED: ['cancel'],
	CANCELLED: []
};

/** Una cotización es un documento todavía no confirmado ni cancelado. */
export function isQuotation(status: SalesOrderStatus): boolean {
	return status === 'DRAFT' || status === 'SENT';
}

/** Solo un borrador es editable; una cotización enviada debe reabrirse antes. */
export function isEditable(status: SalesOrderStatus): boolean {
	return status === 'DRAFT';
}

/** Una cotización vence al terminar el día `validUntil`. Fechas en formato `AAAA-MM-DD`. */
export function isExpired(order: Pick<SalesOrderSummary, 'status' | 'validUntil'>, today: string) {
	return isQuotation(order.status) && today > order.validUntil;
}

/** Transiciones que admite el estado actual, en el orden en que se presentan al usuario. */
export function transitionsFor(status: SalesOrderStatus): readonly SalesOrderTransition[] {
	return TRANSITIONS_BY_STATUS[status];
}

/** Motivo por el que una transición admitida por el estado no puede ejecutarse todavía. */
export type TransitionBlocker = 'no_lines' | 'expired';

/**
 * Precondiciones de contenido de cada transición (además del estado): enviar y confirmar exigen
 * líneas, y confirmar exige que la cotización no haya vencido.
 */
export function blockerFor(
	order: Pick<SalesOrder, 'status' | 'validUntil' | 'lines'>,
	transition: SalesOrderTransition,
	today: string
): TransitionBlocker | null {
	const needsLines = transition === 'send' || transition === 'confirm';
	if (needsLines && order.lines.length === 0) {
		return 'no_lines';
	}
	if (transition === 'confirm' && isExpired(order, today)) {
		return 'expired';
	}
	return null;
}
