import { redirect } from '@sveltejs/kit';
import { loginCredentialsSchema } from '#lib/modules/auth/application/dto/login-credentials.ts';
import { authUseCasesFor } from '#lib/modules/auth/server/auth-module.ts';
import { toActionFailure } from '#lib/server/http/action-failure.ts';
import { AppError } from '#lib/shared/errors/app-error.ts';
import { toSafeRedirectPath } from '#lib/shared/security/safe-redirect.ts';
import { parseFormData } from '#lib/shared/validation/parse-form.ts';
import type { Actions, PageServerLoad } from './$types';

/**
 * Avisos que el login puede mostrar según `?notice=`. Lista cerrada: nunca se refleja texto
 * arbitrario de la URL en la página.
 */
const NOTICES = {
	'password-changed': 'Tu contraseña se cambió. Inicia sesión con la nueva contraseña.',
	'signed-out': 'Has cerrado sesión.'
} as const satisfies Record<string, string>;

export const load: PageServerLoad = ({ url }) => {
	const noticeKey = url.searchParams.get('notice');
	const notice =
		noticeKey && Object.hasOwn(NOTICES, noticeKey)
			? NOTICES[noticeKey as keyof typeof NOTICES]
			: null;
	return { notice };
};

export const actions = {
	/** Controlador fino: valida la entrada, delega en el caso de uso y traduce el resultado a HTTP. */
	default: async ({ request, cookies, url }) => {
		const formData = await request.formData();
		const submittedEmail = String(formData.get('email') ?? '').slice(0, 254);
		try {
			const credentials = parseFormData(formData, loginCredentialsSchema);
			await authUseCasesFor(cookies).login.execute(credentials);
		} catch (caught) {
			if (caught instanceof AppError) {
				// Solo se devuelve el correo para rellenar el formulario; la contraseña, nunca.
				return toActionFailure(caught, { email: submittedEmail });
			}
			throw caught;
		}
		redirect(303, toSafeRedirectPath(url.searchParams.get('redirectTo')));
	}
} satisfies Actions;
