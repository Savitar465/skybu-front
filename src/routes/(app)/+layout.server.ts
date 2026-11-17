import { authUseCasesFor } from '#lib/modules/auth/server/auth-module.ts';
import { withSession } from '#lib/modules/auth/server/session-guards.ts';
import type { LayoutServerLoad } from './$types';

/**
 * Datos comunes a toda la zona autenticada. Solo se envían al navegador la identidad (sin
 * tokens) y el perfil; los tokens se quedan en las cookies httpOnly y en `locals`.
 */
export const load: LayoutServerLoad = (event) => {
	// Permite refrescar identidad/permisos con `invalidate('app:session')` sin recargar la página.
	event.depends('app:session');
	return withSession(event, async (session) => ({
		principal: session.principal,
		profile: await authUseCasesFor(event.cookies).getCurrentProfile.execute(session.accessToken)
	}));
};
