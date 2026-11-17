/**
 * Formato de cifras y fechas para la interfaz. Centralizado para que importes, cantidades y
 * fechas se lean igual en todas las pantallas. Locale de Bolivia: la moneda del sistema es BOB.
 */
const LOCALE = 'es-BO';

const moneyFormatters = new Map<string, Intl.NumberFormat>();

/** Importe con su moneda, siempre con dos decimales (p. ej. «Bs 1.250,00»). */
export function formatMoney(amount: number, currency: string): string {
	let formatter = moneyFormatters.get(currency);
	if (!formatter) {
		formatter = new Intl.NumberFormat(LOCALE, {
			style: 'currency',
			currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		moneyFormatters.set(currency, formatter);
	}
	return formatter.format(amount);
}

/** Importe sin símbolo de moneda, para columnas donde la moneda ya se indica en la cabecera. */
const amountFormatter = new Intl.NumberFormat(LOCALE, {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

export function formatAmount(amount: number): string {
	return amountFormatter.format(amount);
}

const quantityFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 3 });

export function formatQuantity(quantity: number): string {
	return quantityFormatter.format(quantity);
}

const percentFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 });

/** Porcentaje expresado de 0 a 100 (como lo envía la API), p. ej. 13 → «13 %». */
export function formatPercent(percent: number): string {
	return `${percentFormatter.format(percent)} %`;
}

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	timeZone: 'UTC'
});

/** Fecha de calendario `AAAA-MM-DD`. Se formatea en UTC para que no se desplace un día. */
export function formatIsoDate(isoDate: string): string {
	return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
	day: 'numeric',
	month: 'short',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
});

export function formatDateTime(instant: Date): string {
	return dateTimeFormatter.format(instant);
}
