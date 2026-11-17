import type { FieldErrors } from '#lib/shared/errors/app-error.ts';

/**
 * Vista en el cliente del `FormFailure` que devuelven las acciones (`toActionFailure`). Las
 * acciones pueden devolver también datos de éxito, así que `form` es una unión: este helper
 * extrae el fallo, si lo hay, sin que cada página repita la comprobación.
 */
export interface FormFailureView {
	readonly code: string;
	readonly message: string;
	readonly fieldErrors: FieldErrors;
	readonly values: Readonly<Record<string, string>>;
}

export function formFailureOf(form: unknown): FormFailureView | null {
	if (typeof form !== 'object' || form === null) {
		return null;
	}
	return 'code' in form && 'fieldErrors' in form ? (form as FormFailureView) : null;
}

/**
 * Coloca junto a su campo los errores de negocio de la API que se refieren a uno concreto
 * (p. ej. `sku_already_in_use` → campo `sku`). Los demás quedan como mensaje general.
 */
export function placeFieldErrors(
	failure: FormFailureView | null,
	fieldByCode: Readonly<Record<string, string>>
): { fieldErrors: FieldErrors; formMessage: string | null } {
	if (!failure) {
		return { fieldErrors: {}, formMessage: null };
	}
	const field = fieldByCode[failure.code];
	const fieldErrors = field
		? { ...failure.fieldErrors, [field]: [failure.message] }
		: failure.fieldErrors;
	return {
		fieldErrors,
		formMessage: Object.keys(fieldErrors).length === 0 ? failure.message : null
	};
}
