import { z } from 'zod';
import { ValidationError, type FieldErrors } from '#lib/shared/errors/app-error.ts';

/** Tope de filas que se leen de un campo repetido, sea cual sea el esquema (evita abusos). */
const MAX_FORM_ROWS = 500;

type RawField = string | undefined | Record<string, string | undefined>[];

/**
 * Valida un `FormData` contra un esquema Zod.
 *
 * Solo se leen los campos que declara el esquema: cualquier otro campo enviado (p. ej. uno
 * inyectado para alterar la petición) se ignora. Los archivos se descartan: estos formularios
 * solo aceptan texto.
 *
 * Un campo declarado como `z.array(z.object(...))` se lee como filas: el formulario envía cada
 * subcampo repetido con el nombre `<campo>.<subcampo>` (p. ej. `lines.quantity`), y la fila `i`
 * se compone con el valor `i` de cada uno. Así una tabla editable funciona como formulario
 * nativo, y los errores llegan con la ruta `lines.0.quantity`.
 *
 * @throws ValidationError con los errores por campo si la entrada no es válida.
 */
export function parseFormData<Schema extends z.ZodObject>(
	formData: FormData,
	schema: Schema
): z.output<Schema> {
	const rawInput = Object.fromEntries(
		Object.entries(schema.shape).map(([field, fieldSchema]) => [
			field,
			readField(formData, field, fieldSchema)
		])
	);
	const result = schema.safeParse(rawInput);
	if (!result.success) {
		throw new ValidationError('Revisa los datos del formulario.', toFieldErrors(result.error));
	}
	return result.data;
}

/** Convierte los issues de Zod en errores por campo (sin incluir nunca el valor rechazado). */
export function toFieldErrors(error: z.ZodError): FieldErrors {
	const fieldErrors: Record<string, string[]> = {};
	for (const issue of error.issues) {
		const field = issue.path.length > 0 ? issue.path.join('.') : 'form';
		(fieldErrors[field] ??= []).push(issue.message);
	}
	return fieldErrors;
}

function readField(formData: FormData, field: string, fieldSchema: unknown): RawField {
	if (fieldSchema instanceof z.ZodArray && fieldSchema.element instanceof z.ZodObject) {
		return readRows(formData, field, Object.keys(fieldSchema.element.shape));
	}
	return readTextField(formData, field);
}

function readRows(
	formData: FormData,
	field: string,
	subfields: readonly string[]
): Record<string, string | undefined>[] {
	const columns = subfields.map((subfield) => ({
		subfield,
		values: formData.getAll(`${field}.${subfield}`).slice(0, MAX_FORM_ROWS)
	}));
	const rowCount = Math.max(0, ...columns.map((column) => column.values.length));
	return Array.from({ length: rowCount }, (_, index) =>
		Object.fromEntries(columns.map(({ subfield, values }) => [subfield, asText(values[index])]))
	);
}

function readTextField(formData: FormData, field: string): string | undefined {
	return asText(formData.get(field));
}

function asText(value: FormDataEntryValue | null | undefined): string | undefined {
	return typeof value === 'string' ? value : undefined;
}
