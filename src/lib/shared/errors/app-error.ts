/**
 * Jerarquía de errores tipados de la aplicación.
 *
 * Cada categoría corresponde a una de las del backend (`shared.error` + Spring Security) y lleva
 * el `code` estable en snake_case que envía la API, de modo que la UI decide por código y nunca
 * por el texto del mensaje.
 *
 * Se usan clases (y no objetos planos) para poder capturar con `instanceof` solo la categoría
 * que interesa y dejar propagarse el resto hasta el manejador central (`handleError`).
 */

/** Errores por campo: nombre del campo → mensajes. */
export type FieldErrors = Readonly<Record<string, readonly string[]>>;

export abstract class AppError extends Error {
	abstract readonly status: number;

	protected constructor(
		readonly code: string,
		message: string
	) {
		super(message);
		this.name = new.target.name;
	}
}

/** 400: la entrada no cumple el contrato. Lleva los errores de cada campo. */
export class ValidationError extends AppError {
	readonly status = 400;

	constructor(
		message: string,
		readonly fieldErrors: FieldErrors = {},
		code = 'validation_failed'
	) {
		super(code, message);
	}
}

/** 401: sin sesión, credenciales inválidas o sesión caducada/revocada. */
export class UnauthenticatedError extends AppError {
	readonly status = 401;

	constructor(
		code = 'unauthenticated',
		message = 'Tu sesión no es válida. Inicia sesión de nuevo.'
	) {
		super(code, message);
	}
}

/** 403: autenticado, pero sin el permiso necesario. */
export class ForbiddenError extends AppError {
	readonly status = 403;

	constructor(code = 'access_denied', message = 'No tienes permiso para realizar esta operación.') {
		super(code, message);
	}
}

/** 404: el recurso no existe (o pertenece a otra empresa: el backend no distingue a propósito). */
export class NotFoundError extends AppError {
	readonly status = 404;

	constructor(code = 'not_found', message = 'El recurso solicitado no existe.') {
		super(code, message);
	}
}

/** 409: conflicto con el estado actual (duplicados, modificación concurrente...). */
export class ConflictError extends AppError {
	readonly status = 409;

	constructor(code: string, message: string) {
		super(code, message);
	}
}

/** 422: la operación viola una regla de negocio. */
export class BusinessRuleError extends AppError {
	readonly status = 422;

	constructor(code: string, message: string) {
		super(code, message);
	}
}

/** 503: el backend no responde (caído, timeout, red). Es reintentable. */
export class ServiceUnavailableError extends AppError {
	readonly status = 503;

	constructor(message = 'El servicio no está disponible en este momento. Inténtalo más tarde.') {
		super('service_unavailable', message);
	}
}

/**
 * 502: el backend respondió algo que no cumple el contrato esperado (esquema distinto, error
 * 5xx...). Indica un fallo de integración, no del usuario.
 */
export class UpstreamError extends AppError {
	readonly status = 502;

	constructor(message = 'Ha ocurrido un error inesperado. Inténtalo más tarde.') {
		super('upstream_error', message);
	}
}
