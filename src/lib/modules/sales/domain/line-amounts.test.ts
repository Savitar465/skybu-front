import { describe, expect, it } from 'vitest';
import { calculateLineAmounts, centsToAmount, parseScaled, sumAmounts } from './line-amounts';

const line = (quantity: string, unitPrice: number, discountPercent = '', taxRatePercent = 13) =>
	calculateLineAmounts({ quantity, unitPrice, discountPercent, taxRatePercent });

describe('calculateLineAmounts', () => {
	it('calcula subtotal, impuesto y total como el backend', () => {
		expect(line('2', 35.5)).toEqual({ subtotalCents: 7100n, taxCents: 923n, totalCents: 8023n });
	});

	it('aplica el descuento antes del impuesto', () => {
		// 3 × 100 = 300; −10 % = 270; 13 % = 35,10
		expect(line('3', 100, '10')).toEqual({
			subtotalCents: 27000n,
			taxCents: 3510n,
			totalCents: 30510n
		});
	});

	it('redondea mitad hacia arriba por línea, sin errores de coma flotante', () => {
		// 0,5 × 2,01 = 1,005 → 1,01 (en coma flotante 1,005 se redondearía a 1,00).
		expect(line('0.5', 2.01, '', 0)?.subtotalCents).toBe(101n);
		// 1 × 0,05 × 50 % = 0,025 → 0,03; impuesto 13 % de 0,03 = 0,0039 → 0,00.
		expect(line('1', 0.05, '50')).toEqual({ subtotalCents: 3n, taxCents: 0n, totalCents: 3n });
		// 3 × 0,10 = 0,30 exactos.
		expect(line('3', 0.1, '', 0)?.subtotalCents).toBe(30n);
	});

	it('admite coma decimal y hasta tres decimales en la cantidad', () => {
		// 0,333 × 10 = 3,33; 13 % = 0,4329 → 0,43
		expect(line('0,333', 10)).toEqual({ subtotalCents: 333n, taxCents: 43n, totalCents: 376n });
	});

	it.each([
		['', 'cantidad vacía'],
		['0', 'cantidad cero'],
		['-1', 'cantidad negativa'],
		['1.2345', 'más de tres decimales'],
		['dos', 'texto']
	])('no calcula con %j (%s)', (quantity) => {
		expect(line(quantity, 10)).toBeNull();
	});

	it('no calcula con un descuento mayor que 100 %', () => {
		expect(line('1', 10, '100.01')).toBeNull();
		expect(line('1', 10, '100')?.totalCents).toBe(0n);
	});
});

describe('sumAmounts', () => {
	it('suma líneas ya redondeadas', () => {
		const lines = [line('1', 0.05, '50'), line('1', 0.05, '50')].filter(
			(amounts) => amounts !== null
		);

		expect(sumAmounts(lines)).toEqual({ subtotalCents: 6n, taxCents: 0n, totalCents: 6n });
		expect(sumAmounts([])).toEqual({ subtotalCents: 0n, taxCents: 0n, totalCents: 0n });
	});

	it('convierte céntimos en importe', () => {
		expect(centsToAmount(8023n)).toBe(80.23);
	});
});

describe('parseScaled', () => {
	it('recupera exactamente los decimales de un número de la API', () => {
		expect(parseScaled(35.5, 2)).toBe(3550n);
		expect(parseScaled(0.1, 2)).toBe(10n);
		expect(parseScaled(999_999_999_999.99, 2)).toBe(99_999_999_999_999n);
	});
});
