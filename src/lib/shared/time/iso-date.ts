/**
 * Fecha de calendario (`AAAA-MM-DD`) en la zona horaria local del proceso. Las fechas sin hora
 * de la API (p. ej. la validez de una cotización) se comparan como texto en este formato: el
 * orden lexicográfico coincide con el cronológico y se evitan los desfases de `Date` con UTC.
 */
export function toLocalIsoDate(instant: Date): string {
	const year = instant.getFullYear().toString().padStart(4, '0');
	const month = (instant.getMonth() + 1).toString().padStart(2, '0');
	const day = instant.getDate().toString().padStart(2, '0');
	return `${year}-${month}-${day}`;
}
