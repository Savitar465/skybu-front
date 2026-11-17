import { authUseCasesFor } from '#lib/modules/auth/server/auth-module.ts';
import { withSession } from '#lib/modules/auth/server/session-guards.ts';
import type { PageServerLoad } from './$types';

/**
 * El permiso `iam:roles:read` ya lo exige el hook (ver `ROUTE_PERMISSION_RULES`), y la API lo
 * vuelve a comprobar. Este `load` solo pide los datos.
 */
export const load: PageServerLoad = (event) =>
	withSession(event, async (session) => ({
		roles: await authUseCasesFor(event.cookies).listRoles.execute(session.accessToken)
	}));
