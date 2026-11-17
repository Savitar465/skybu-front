import { formatIsoDate } from '#lib/shared/formatting/format.ts';
import type { BadgeTone } from '#lib/shared/ui/Badge.svelte';
import {
	isQuotation,
	type SalesOrderStatus,
	type SalesOrderTransition,
	type TransitionBlocker
} from '../domain/sales-order';

/** Textos de la interfaz de ventas para los valores que envía la API. */

export const STATUS_BADGES: Readonly<Record<SalesOrderStatus, { label: string; tone: BadgeTone }>> =
	{
		DRAFT: { label: 'Borrador', tone: 'neutral' },
		SENT: { label: 'Enviada', tone: 'accent' },
		CONFIRMED: { label: 'Confirmado', tone: 'success' },
		CANCELLED: { label: 'Cancelado', tone: 'danger' }
	};

export const EXPIRED_BADGE = { label: 'Vencida', tone: 'warning' } as const;

/** Nombre del documento según su estado: hasta confirmarse es una cotización. */
export function documentKind(status: SalesOrderStatus): string {
	return isQuotation(status) ? 'Cotización' : 'Pedido de venta';
}

export const TRANSITION_LABELS: Readonly<Record<SalesOrderTransition, string>> = {
	send: 'Marcar como enviada',
	reopen: 'Reabrir',
	confirm: 'Confirmar pedido',
	cancel: 'Cancelar'
};

export const TRANSITION_DONE: Readonly<Record<SalesOrderTransition, string>> = {
	send: 'Cotización marcada como enviada. Ya no se puede editar salvo que la reabras.',
	reopen: 'Cotización reabierta. Vuelve a ser un borrador editable.',
	confirm: 'Pedido confirmado.',
	cancel: 'Documento cancelado.'
};

export function blockerMessage(blocker: TransitionBlocker, validUntil: string): string {
	switch (blocker) {
		case 'no_lines':
			return 'Añade al menos una línea antes de enviarla o confirmarla.';
		case 'expired':
			return `La cotización venció el ${formatIsoDate(validUntil)}. Edítala y amplía su validez para poder confirmarla.`;
	}
}

/** Avisos tras redirigir (`?notice=`). Solo códigos conocidos: nunca se refleja texto de la URL. */
export const SALES_NOTICES = {
	created: 'Cotización creada como borrador.',
	saved: 'Cambios guardados.'
} as const;

export type SalesNotice = keyof typeof SALES_NOTICES;

/** Errores de negocio de la API que corresponden a un campo concreto del editor. */
export const QUOTATION_ERROR_FIELDS: Readonly<Record<string, string>> = {
	customer_not_active: 'customerId',
	unknown_customer: 'customerId'
};
