import { z } from 'zod';

/**
 * Esquemas reutilizables para leer formularios y parámetros de URL. Todos parten de texto (lo
 * que envía un formulario) y normalizan antes de validar.
 */

/** Texto obligatorio, sin espacios sobrantes. */
export function requiredText(options: { maxLength: number; required: string; tooLong: string }) {
	return z
		.string({ error: options.required })
		.trim()
		.min(1, options.required)
		.max(options.maxLength, options.tooLong);
}

/**
 * Campo opcional de formulario: ausente, vacío o solo espacios → `null`; cualquier otro valor
 * (recortado) se valida con `schema`. No se usa `z.union` porque, cuando ninguna opción encaja,
 * Zod devuelve un «Invalid input» genérico en lugar del mensaje del esquema interno.
 */
function emptyAsNull<Output>(schema: z.ZodType<Output, string>) {
	return z
		.string()
		.optional()
		.transform((value, context): Output | null => {
			const text = value?.trim() ?? '';
			if (text === '') {
				return null;
			}
			const result = schema.safeParse(text);
			if (result.success) {
				return result.data;
			}
			for (const issue of result.error.issues) {
				context.addIssue({ code: 'custom', message: issue.message });
			}
			return z.NEVER;
		});
}

/** Texto opcional: vacío o solo espacios se convierte en `null` (como hace el backend). */
export function optionalText(options: { maxLength: number; tooLong: string }) {
	return emptyAsNull(z.string().max(options.maxLength, options.tooLong));
}

/** Identificador opcional (p. ej. un `<select>` con la opción «Ninguna»): vacío → `null`. */
export function optionalUuid(message: string) {
	return emptyAsNull(z.uuid(message));
}

/** Fecha ISO `AAAA-MM-DD` opcional, como la envía un `<input type="date">`. Vacía → `null`. */
export function optionalIsoDate(message: string) {
	return emptyAsNull(z.iso.date(message));
}

interface DecimalOptions {
	/** Dígitos máximos de la parte entera. */
	readonly integerDigits: number;
	/** Decimales máximos. */
	readonly fractionDigits: number;
	readonly required: string;
	readonly invalid: string;
	readonly min?: { readonly value: number; readonly inclusive: boolean; readonly message: string };
	readonly max?: { readonly value: number; readonly message: string };
}

/**
 * Número decimal escrito por una persona. Acepta coma o punto como separador decimal (en
 * Bolivia se usan ambos) y limita los dígitos igual que `@Digits` en el backend, para que lo
 * que se valida aquí sea exactamente lo que la API acepta.
 */
export function decimalNumber(options: DecimalOptions) {
	const pattern = new RegExp(
		`^\\d{1,${options.integerDigits}}(\\.\\d{1,${options.fractionDigits}})?$`
	);
	return z
		.string({ error: options.required })
		.trim()
		.min(1, options.required)
		.transform((value) => value.replace(',', '.'))
		.pipe(z.string().regex(pattern, options.invalid))
		.transform(Number)
		.superRefine((value, context) => {
			const { min, max } = options;
			if (min && (min.inclusive ? value < min.value : value <= min.value)) {
				context.addIssue({ code: 'custom', message: min.message });
			}
			if (max && value > max.value) {
				context.addIssue({ code: 'custom', message: max.message });
			}
		});
}

/** Como `decimalNumber`, pero vacío se acepta y se convierte en `null`. */
export function optionalDecimalNumber(options: Omit<DecimalOptions, 'required'>) {
	return emptyAsNull(decimalNumber({ ...options, required: options.invalid }));
}

/** Número de página en la URL (1, 2, 3...). Un valor inválido vuelve a la primera página. */
export const pageNumberParam = z.coerce.number().int().min(1).max(10_000).catch(1);

/** Texto de búsqueda en la URL. Se recorta a la longitud que acepta la API. */
export const searchParam = (maxLength: number) =>
	z
		.string()
		.optional()
		.transform((value) => (value ?? '').trim().slice(0, maxLength))
		.catch('');
