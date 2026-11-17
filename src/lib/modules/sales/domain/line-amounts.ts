/**
 * Cálculo de importes de una línea, idéntico al de `OrderLineDraft` en el backend:
 *
 *   subtotal = cantidad × precio × (100 − descuento) / 100   → redondeo a 2 decimales
 *   impuesto = subtotal × tasa / 100                         → redondeo a 2 decimales
 *   total    = subtotal + impuesto
 *
 * Redondeo «mitad hacia arriba» en cada línea; el documento suma líneas ya redondeadas.
 *
 * Se usa para la vista previa mientras se edita una cotización: el servidor recalcula siempre
 * con el precio vigente del catálogo y su resultado es el que se guarda. La aritmética es
 * entera (`bigint`) para que la vista previa coincida al céntimo: con `number` (coma flotante)
 * 0,1 × 3 no da 0,3 y los redondeos divergirían.
 */

const QUANTITY_SCALE = 3;
const MONEY_SCALE = 2;
const PERCENT_SCALE = 2;
/** 100 % expresado con dos decimales de escala. */
const HUNDRED_PERCENT = 10_000n;

export interface LineAmountsInput {
	/** Texto tal y como lo escribe el usuario (admite coma decimal). */
	readonly quantity: string;
	readonly unitPrice: number;
	/** Vacío equivale a 0, como en la API. */
	readonly discountPercent: string;
	readonly taxRatePercent: number;
}

/** Importes en céntimos, para sumar sin pérdida. */
export interface LineAmounts {
	readonly subtotalCents: bigint;
	readonly taxCents: bigint;
	readonly totalCents: bigint;
}

export const ZERO_AMOUNTS: LineAmounts = { subtotalCents: 0n, taxCents: 0n, totalCents: 0n };

/** Importes de la línea, o `null` si algún dato todavía no es válido (p. ej. a medio escribir). */
export function calculateLineAmounts(input: LineAmountsInput): LineAmounts | null {
	const quantity = parseScaled(input.quantity, QUANTITY_SCALE);
	const unitPriceCents = parseScaled(input.unitPrice, MONEY_SCALE);
	const discount =
		input.discountPercent.trim() === '' ? 0n : parseScaled(input.discountPercent, PERCENT_SCALE);
	const taxRate = parseScaled(input.taxRatePercent, PERCENT_SCALE);
	if (
		quantity === null ||
		quantity === 0n ||
		unitPriceCents === null ||
		discount === null ||
		discount > HUNDRED_PERCENT ||
		taxRate === null
	) {
		return null;
	}
	// cantidad (×10³) × precio (×10²) × (100 − dto) (×10²) / 100  →  céntimos (×10²): ÷10⁷
	const subtotalCents = divideHalfUp(
		quantity * unitPriceCents * (HUNDRED_PERCENT - discount),
		10n ** BigInt(QUANTITY_SCALE + PERCENT_SCALE + 2)
	);
	const taxCents = divideHalfUp(subtotalCents * taxRate, HUNDRED_PERCENT);
	return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents };
}

/** Suma de los importes de todas las líneas (cada una ya redondeada). */
export function sumAmounts(lines: readonly LineAmounts[]): LineAmounts {
	return lines.reduce(
		(sum, line) => ({
			subtotalCents: sum.subtotalCents + line.subtotalCents,
			taxCents: sum.taxCents + line.taxCents,
			totalCents: sum.totalCents + line.totalCents
		}),
		ZERO_AMOUNTS
	);
}

/** Céntimos → importe en unidades de moneda, para mostrarlo. */
export function centsToAmount(cents: bigint): number {
	return Number(cents) / 100;
}

/**
 * Convierte un decimal no negativo en entero escalado (`"1,5"` con escala 3 → `1500n`).
 * Devuelve `null` si no es un número válido o tiene más decimales de los admitidos.
 */
export function parseScaled(value: string | number, scale: number): bigint | null {
	const text = typeof value === 'number' ? numberToText(value, scale) : value.trim();
	if (text === null) {
		return null;
	}
	const match = /^(\d+)(?:[.,](\d+))?$/.exec(text);
	if (!match) {
		return null;
	}
	const [, integerPart, fractionPart = ''] = match;
	if (fractionPart.length > scale) {
		return null;
	}
	return BigInt(integerPart + fractionPart.padEnd(scale, '0'));
}

/**
 * Los importes de la API llegan como `number` con, como mucho, `scale` decimales; `toFixed`
 * recupera exactamente esos dígitos (el binario más cercano siempre redondea al decimal original).
 */
function numberToText(value: number, scale: number): string | null {
	return Number.isFinite(value) && value >= 0 ? value.toFixed(scale) : null;
}

/** División entera de no negativos con redondeo mitad hacia arriba (`RoundingMode.HALF_UP`). */
function divideHalfUp(dividend: bigint, divisor: bigint): bigint {
	const quotient = dividend / divisor;
	const remainder = dividend % divisor;
	return remainder * 2n >= divisor ? quotient + 1n : quotient;
}
