import { redirect } from '@sveltejs/kit';
import { changePasswordInputSchema } from '#lib/modules/auth/application/dto/change-password-input.ts';
import { authUseCasesFor } from '#lib/modules/auth/server/auth-module.ts';
import { withSession } from '#lib/modules/auth/server/session-guards.ts';
import { toActionFailure } from '#lib/server/http/action-failure.ts';
import { AppError } from '#lib/shared/errors/app-error.ts';
import { parseFormData } from '#lib/shared/validation/parse-form.ts';
import type { Actions } from './$types';

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		try {
			await withSession(event, (session) => {
				const input = parseFormData(formData, changePasswordInputSchema);
				return authUseCasesFor(event.cookies).changePassword.execute(session.accessToken, input);
			});
		} catch (caught) {
			if (caught instanceof AppError) {
				// Ningún valor se devuelve: todos los campos son contraseñas.
				return toActionFailure(caught);
			}
			throw caught;
		}
		// La API cerró todas las sesiones del usuario: debe entrar con la contraseña nueva.
		redirect(303, '/login?notice=password-changed');
	}
} satisfies Actions;
