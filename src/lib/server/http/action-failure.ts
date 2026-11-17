import { fail, type ActionFailure } from '@sveltejs/kit';
import { AppError, ValidationError, type FieldErrors } from '#lib/shared/errors/app-error.ts';

/** Forma común de los errores que una acción de formulario devuelve a su página. */
export interface FormFailure {
	readonly code: string;
	readonly message: string;
	readonly fieldErrors: FieldErrors;
	/** Valores para volver a rellenar el formulario. Nunca contraseñas ni otros secretos. */
	readonly values: Readonly<Record<string, string>>;
}

/**
 * Valores de texto de un formulario para volver a rellenarlo tras un error. Solo se copian los
 * campos indicados (nunca contraseñas ni otros secretos) y recortados a una longitud razonable.
 */
export function formValues(
	formData: FormData,
	fields: readonly string[]
): Readonly<Record<string, string>> {
	const MAX_VALUE_LENGTH = 2000;
	const values: Record<string, string> = {};
	for (const field of fields) {
		const value = formData.get(field);
		if (typeof value === 'string') {
			values[field] = value.slice(0, MAX_VALUE_LENGTH);
		}
	}
	return values;
}

/**
 * Convierte un `AppError` en un `ActionFailure` que la página puede mostrar junto al formulario.
 * Solo se usa con errores ya tipados; cualquier otro error debe propagarse al `handleError`
 * central (no se silencia ni se convierte en un mensaje genérico aquí).
 */
export function toActionFailure(
	error: AppError,
	values: Readonly<Record<string, string>> = {}
): ActionFailure<FormFailure> {
	return fail(error.status, {
		code: error.code,
		message: error.message,
		fieldErrors: error instanceof ValidationError ? error.fieldErrors : {},
		values
	});
}
