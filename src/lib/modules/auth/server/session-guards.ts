import { error, redirect, type ActionFailure, type RequestEvent } from '@sveltejs/kit';
import { toActionFailure, type FormFailure } from '#lib/server/http/action-failure.ts';
import { AppError, UnauthenticatedError } from '#lib/shared/errors/app-error.ts';
import { loginPathFor } from '#lib/shared/security/safe-redirect.ts';
import { satisfies, type PermissionRequirement } from '../domain/principal';
import type { AuthenticatedSession } from '../domain/session';
import { authUseCasesFor } from './auth-module';

/**
 * Devuelve la sesión de la petición o redirige al login. El hook ya garantiza la sesión en las
 * rutas protegidas; esto da además el tipo no nulo a `load` y acciones.
 */
export function requireSession(event: RequestEvent): AuthenticatedSession {
	const session = event.locals.session;
	if (!session) {
		redirect(303, loginPathFor(event.url));
	}
	return session;
}

/**
 * Exige un permiso concreto. Para acciones que necesitan más que la ruta (p. ej. una página de
 * lectura con una acción de gestión). Es solo la primera barrera: la API vuelve a comprobarlo.
 */
export function requirePermission(
	event: RequestEvent,
	requirement: PermissionRequirement
): AuthenticatedSession {
	const session = requireSession(event);
	if (!satisfies(session.principal, requirement)) {
		error(403, {
			code: 'access_denied',
			message: 'No tienes permiso para realizar esta operación.'
		});
	}
	return session;
}

/**
 * Ejecuta una operación contra la API con la sesión actual. Si la API responde 401 (usuario
 * desactivado, contraseña cambiada en otro dispositivo, empresa suspendida...), se descarta la
 * sesión local y se envía al usuario al login en lugar de mostrar un error.
 */
export async function withSession<Result>(
	event: RequestEvent,
	operation: (session: AuthenticatedSession) => Promise<Result>
): Promise<Result> {
	const session = requireSession(event);
	try {
		return await operation(session);
	} catch (caught) {
		if (caught instanceof UnauthenticatedError) {
			authUseCasesFor(event.cookies).discardSession();
			redirect(303, loginPathFor(event.url));
		}
		throw caught;
	}
}

/**
 * Variante de `withSession` para acciones de formulario: los errores tipados (validación,
 * reglas de negocio, conflictos, API no disponible...) se devuelven como `ActionFailure` para
 * mostrarlos junto al formulario, con `values` para volver a rellenarlo. El resto de errores
 * (defectos) se propagan al `handleError` central.
 *
 * El resultado es discriminado (`ok`) para que el llamador decida qué hacer con cada caso
 * (p. ej. redirigir tras crear) sin volver a capturar errores.
 */
export async function withSessionAction<Result>(
	event: RequestEvent,
	operation: (session: AuthenticatedSession) => Promise<Result>,
	values: Readonly<Record<string, string>> = {}
): Promise<ActionOutcome<Result>> {
	try {
		return { ok: true, value: await withSession(event, operation) };
	} catch (caught) {
		if (caught instanceof AppError) {
			return { ok: false, failure: toActionFailure(caught, values) };
		}
		throw caught;
	}
}

export type ActionOutcome<Result> =
	| { readonly ok: true; readonly value: Result }
	| { readonly ok: false; readonly failure: ActionFailure<FormFailure> };
