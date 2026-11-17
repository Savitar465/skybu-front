import { describe, expect, it } from 'vitest';
import { toLocalIsoDate } from '#lib/shared/time/iso-date.ts';
import { withQuery } from './url';

describe('withQuery', () => {
	it('añade solo los parámetros con valor', () => {
		expect(withQuery('/catalog/products', { search: 'café', inactive: null, page: 2 })).toBe(
			'/catalog/products?search=caf%C3%A9&page=2'
		);
		expect(withQuery('/catalog/products', { search: '' })).toBe('/catalog/products');
	});
});

describe('toLocalIsoDate', () => {
	it('toma el día local, no el de UTC', () => {
		expect(toLocalIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
	});
});
