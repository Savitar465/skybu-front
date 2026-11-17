import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { UnauthenticatedError } from '#lib/shared/errors/app-error.ts';
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
