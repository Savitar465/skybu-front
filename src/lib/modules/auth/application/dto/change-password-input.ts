import { z } from 'zod';

/** Límites de `ChangePasswordRequest` del backend (72 es el máximo útil de BCrypt). */
export const NEW_PASSWORD_MIN_LENGTH = 12;
export const NEW_PASSWORD_MAX_LENGTH = 72;

/**
 * Entrada del cambio de contraseña. La política completa (complejidad, que no contenga el
 * correo...) la aplica el backend; aquí se valida lo necesario para dar feedback inmediato.
 */
export const changePasswordInputSchema = z
	.object({
		currentPassword: z
			.string({ error: 'Introduce tu contraseña actual.' })
			.min(1, 'Introduce tu contraseña actual.')
			.max(128, 'La contraseña no puede superar 128 caracteres.'),
		newPassword: z
			.string({ error: 'Introduce la nueva contraseña.' })
			.min(
				NEW_PASSWORD_MIN_LENGTH,
				`La nueva contraseña debe tener al menos ${NEW_PASSWORD_MIN_LENGTH} caracteres.`
			)
			.max(
				NEW_PASSWORD_MAX_LENGTH,
				`La nueva contraseña no puede superar ${NEW_PASSWORD_MAX_LENGTH} caracteres.`
			),
		newPasswordConfirmation: z.string({ error: 'Repite la nueva contraseña.' })
	})
	.refine((input) => input.newPassword === input.newPasswordConfirmation, {
		path: ['newPasswordConfirmation'],
		message: 'Las contraseñas no coinciden.'
	})
	.refine((input) => input.newPassword !== input.currentPassword, {
		path: ['newPassword'],
		message: 'La nueva contraseña debe ser distinta de la actual.'
	});

export type ChangePasswordInput = z.output<typeof changePasswordInputSchema>;
