import { error, redirect } from '@sveltejs/kit';
import { sequence, type Handle, type HandleServerError } from '@sveltejs/kit/hooks';
import { authUseCasesFor, routeAccessPolicy } from '#lib/modules/auth/server/auth-module.ts';
import { applySecurityHeaders } from '#lib/server/security/security-headers.ts';
import { AppError, ServiceUnavailableError, UpstreamError } from '#lib/shared/errors/app-error.ts';
import { consoleLogger } from '#lib/shared/logging/logger.ts';
import { DEFAULT_AUTHENTICATED_PATH, loginPathFor } from '#lib/shared/security/safe-redirect.ts';

/**
 * 1. Autenticación: resuelve la sesión de la petición (renovándola si hace falta).
 *
 * Si la API no está disponible no se borra la sesión: la petición sigue como anónima y se marca
 * para que la autorización responda 503 en vez de mandar al usuario al login.
 */
const authenticate: Handle = async ({ event, resolve }) => {
	event.locals.session = null;
	event.locals.sessionUnavailable = false;
	try {
		event.locals.session = await authUseCasesFor(event.cookies).resolveSession.execute();
	} catch (caught) {
		if (caught instanceof ServiceUnavailableError || caught instanceof UpstreamError) {
			event.locals.sessionUnavailable = true;
		} else {
			throw caught;
		}
	}
	return resolve(event);
};

/**
 * 2. Autorización por ruta, centralizada y denegando por defecto (ver `RouteAccessPolicy`).
 * Cubre páginas, peticiones de datos, acciones de formulario y endpoints por igual.
 */
const authorize: Handle = ({ event, resolve }) => {
	const decision = routeAccessPolicy.evaluate(
		event.route.id,
		event.locals.session?.principal ?? null
	);
	// `redirect` y `error` lanzan: SvelteKit los convierte en la respuesta adecuada también
	// para peticiones de datos (navegación en cliente) y acciones con `use:enhance`.
	if (decision.kind === 'redirect-authenticated') {
		redirect(303, DEFAULT_AUTHENTICATED_PATH);
	}
	if (decision.kind === 'require-login') {
		if (event.locals.sessionUnavailable) {
			error(503, { code: 'service_unavailable', message: new ServiceUnavailableError().message });
		}
		redirect(303, loginPathFor(event.url));
	}
	if (decision.kind === 'forbidden') {
		error(403, {
			code: 'access_denied',
			message: 'No tienes permiso para acceder a esta sección.'
		});
	}
	return resolve(event);
};

/** 3. Cabeceras de seguridad en toda respuesta. */
const secureResponse: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	applySecurityHeaders(response, { authenticated: event.locals.session !== null });
	return response;
};

export const handle = sequence(secureResponse, authenticate, authorize);

/**
 * Manejo de errores centralizado. Los `AppError` (p. ej. un 404 o 403 de la API lanzado desde
 * un `load`) se muestran con su estado, código y mensaje seguro. Cualquier otro error se
 * registra completo con un identificador y al usuario solo le llega un mensaje genérico con
 * ese identificador, sin detalles internos.
 */
export const handleError: HandleServerError = (caught) => {
	if (caught.kind === 'app') {
		return { code: caught.error.code };
	}
	if (caught.kind === 'framework' || caught.kind === 'validation') {
		return { code: caught.error.status === 404 ? 'not_found' : 'request_error' };
	}
	if (caught.error instanceof AppError) {
		return { status: caught.error.status, code: caught.error.code, message: caught.error.message };
	}
	const errorId = crypto.randomUUID();
	consoleLogger.error('Error no controlado', {
		errorId,
		route: caught.event.route.id,
		method: caught.event.request.method,
		error: caught.error
	});
	return {
		status: 500,
		code: 'internal_error',
		message: 'Ha ocurrido un error inesperado.',
		errorId
	};
};
