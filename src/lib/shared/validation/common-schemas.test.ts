import { describe, expect, it } from 'vitest';
import {
	decimalNumber,
	optionalDecimalNumber,
	optionalIsoDate,
	optionalText,
	optionalUuid,
	pageNumberParam,
	searchParam
} from './common-schemas';

const price = decimalNumber({
	integerDigits: 4,
	fractionDigits: 2,
	required: 'obligatorio',
	invalid: 'inválido',
	min: { value: 0, inclusive: false, message: 'mayor que 0' },
	max: { value: 1000, message: 'demasiado alto' }
});

const messagesOf = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
	result.error?.issues.map((issue) => issue.message);

describe('decimalNumber', () => {
	it.each([
		['12', 12],
		['12.5', 12.5],
		['12,50', 12.5],
		['  7 ', 7]
	])('acepta %j', (input, expected) => {
		expect(price.parse(input)).toBe(expected);
	});

	it.each([
		['', 'obligatorio'],
		['abc', 'inválido'],
		['1.234', 'inválido'],
		['-3', 'inválido'],
		['1.000,50', 'inválido'],
		['12345', 'inválido'],
		['0', 'mayor que 0'],
		['1000.01', 'demasiado alto']
	])('rechaza %j con «%s»', (input, message) => {
		expect(messagesOf(price.safeParse(input))).toEqual([message]);
	});
});

describe('optionalDecimalNumber', () => {
	const discount = optionalDecimalNumber({
		integerDigits: 3,
		fractionDigits: 2,
		invalid: 'inválido'
	});

	it('convierte vacío o ausente en null', () => {
		expect(discount.parse('')).toBeNull();
		expect(discount.parse(undefined)).toBeNull();
		expect(discount.parse('  ')).toBeNull();
	});

	it('valida el número cuando hay valor', () => {
		expect(discount.parse('7,5')).toBe(7.5);
		expect(messagesOf(discount.safeParse('x'))).toEqual(['inválido']);
	});
});

describe('textos y referencias opcionales', () => {
	it('optionalText recorta y convierte vacío en null', () => {
		const notes = optionalText({ maxLength: 5, tooLong: 'largo' });
		expect(notes.parse('  hola  ')).toBe('hola');
		expect(notes.parse('   ')).toBeNull();
		expect(messagesOf(notes.safeParse('demasiado'))).toEqual(['largo']);
	});

	it('optionalUuid acepta vacío o un UUID', () => {
		const categoryId = optionalUuid('inválida');
		expect(categoryId.parse('')).toBeNull();
		expect(categoryId.parse('2f1c2b9e-5d0a-4f0e-9a1b-3c4d5e6f7a8b')).toBe(
			'2f1c2b9e-5d0a-4f0e-9a1b-3c4d5e6f7a8b'
		);
		expect(messagesOf(categoryId.safeParse('../otra'))).toEqual(['inválida']);
	});

	it('optionalIsoDate acepta vacío o AAAA-MM-DD', () => {
		const validUntil = optionalIsoDate('fecha inválida');
		expect(validUntil.parse('')).toBeNull();
		expect(validUntil.parse('2026-04-30')).toBe('2026-04-30');
		expect(messagesOf(validUntil.safeParse('30/04/2026'))).toEqual(['fecha inválida']);
	});
});

describe('parámetros de URL', () => {
	it('una página inválida vuelve a la primera', () => {
		expect(pageNumberParam.parse('3')).toBe(3);
		expect(pageNumberParam.parse('0')).toBe(1);
		expect(pageNumberParam.parse('abc')).toBe(1);
		expect(pageNumberParam.parse(undefined)).toBe(1);
	});

	it('la búsqueda se recorta a la longitud admitida', () => {
		expect(searchParam(5).parse('  café molido ')).toBe('café ');
		expect(searchParam(5).parse(undefined)).toBe('');
	});
});
