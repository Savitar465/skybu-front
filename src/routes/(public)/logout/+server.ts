import { redirect } from '@sveltejs/kit';
import { authUseCasesFor } from '#lib/modules/auth/server/auth-module.ts';
import type { RequestHandler } from './$types';

/**
 * Cierre de sesión. Solo por POST: con GET bastaría una `<img src="/logout">` en cualquier web
 * para desconectar al usuario. SvelteKit rechaza además los POST de formulario de otro origen.
 *
 * Se responde con una redirección de página completa para descartar todo el estado del cliente.
 */
export const POST: RequestHandler = async ({ cookies }) => {
	await authUseCasesFor(cookies).logout.execute();
	redirect(303, '/login?notice=signed-out');
};
