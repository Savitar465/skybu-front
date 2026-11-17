import { describe, expect, it } from 'vitest';
import { salesOrder, TODAY } from '../testing/fakes';
import { blockerFor, isEditable, isExpired, isQuotation, transitionsFor } from './sales-order';

describe('ciclo de vida del documento de venta', () => {
	it('ofrece solo las transiciones que admite cada estado', () => {
		expect(transitionsFor('DRAFT')).toEqual(['send', 'confirm', 'cancel']);
		expect(transitionsFor('SENT')).toEqual(['reopen', 'confirm', 'cancel']);
		expect(transitionsFor('CONFIRMED')).toEqual(['cancel']);
		expect(transitionsFor('CANCELLED')).toEqual([]);
	});

	it('solo un borrador es editable', () => {
		expect(isEditable('DRAFT')).toBe(true);
		expect(isEditable('SENT')).toBe(false);
		expect(isEditable('CONFIRMED')).toBe(false);
	});

	it('distingue cotizaciones de pedidos', () => {
		expect(isQuotation('DRAFT')).toBe(true);
		expect(isQuotation('SENT')).toBe(true);
		expect(isQuotation('CONFIRMED')).toBe(false);
		expect(isQuotation('CANCELLED')).toBe(false);
	});
});

describe('vencimiento', () => {
	it('una cotización vence al terminar el día de su validez', () => {
		expect(isExpired({ status: 'SENT', validUntil: TODAY }, TODAY)).toBe(false);
		expect(isExpired({ status: 'SENT', validUntil: '2026-03-14' }, TODAY)).toBe(true);
	});

	it('un pedido confirmado o cancelado no vence', () => {
		expect(isExpired({ status: 'CONFIRMED', validUntil: '2020-01-01' }, TODAY)).toBe(false);
		expect(isExpired({ status: 'CANCELLED', validUntil: '2020-01-01' }, TODAY)).toBe(false);
	});
});

describe('blockerFor', () => {
	it('enviar y confirmar exigen líneas; cancelar no', () => {
		const empty = salesOrder({ lines: [] });

		expect(blockerFor(empty, 'send', TODAY)).toBe('no_lines');
		expect(blockerFor(empty, 'confirm', TODAY)).toBe('no_lines');
		expect(blockerFor(empty, 'cancel', TODAY)).toBeNull();
	});

	it('confirmar exige que la cotización no haya vencido', () => {
		const expired = salesOrder({ status: 'SENT', validUntil: '2026-03-01' });

		expect(blockerFor(expired, 'confirm', TODAY)).toBe('expired');
		expect(blockerFor(expired, 'reopen', TODAY)).toBeNull();
	});

	it('sin impedimentos, la transición puede ejecutarse', () => {
		expect(blockerFor(salesOrder(), 'confirm', TODAY)).toBeNull();
	});
});
