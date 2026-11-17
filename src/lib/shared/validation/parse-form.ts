import { z } from 'zod';
import { ValidationError, type FieldErrors } from '#lib/shared/errors/app-error.ts';

/**
 * Valida un `FormData` contra un esquema Zod.
 *
 * Solo se leen los campos que declara el esquema: cualquier otro campo enviado (p. ej. uno
 * inyectado para alterar la petición) se ignora. Los archivos se descartan: estos formularios
 * solo aceptan texto.
 *
 * @throws ValidationError con los errores por campo si la entrada no es válida.
 */
export function parseFormData<Schema extends z.ZodObject>(
	formData: FormData,
	schema: Schema
): z.output<Schema> {
	const rawInput = Object.fromEntries(
		Object.keys(schema.shape).map((field) => [field, readTextField(formData, field)])
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

function readTextField(formData: FormData, field: string): string | undefined {
	const value = formData.get(field);
	return typeof value === 'string' ? value : undefined;
}
