import { z } from 'zod';

/**
 * Entrada del formulario de login. Los límites coinciden con `LoginRequest` del backend; el
 * máximo de la contraseña evita además enviar entradas gigantes que la API tendría que hashear.
 *
 * La contraseña no se recorta ni se normaliza: los espacios forman parte de ella.
 */
export const loginCredentialsSchema = z.object({
	email: z
		.string({ error: 'Introduce tu correo electrónico.' })
		.trim()
		.toLowerCase()
		.min(1, 'Introduce tu correo electrónico.')
		.max(254, 'El correo no puede superar 254 caracteres.')
		.pipe(z.email('Introduce un correo electrónico válido.')),
	password: z
		.string({ error: 'Introduce tu contraseña.' })
		.min(1, 'Introduce tu contraseña.')
		.max(128, 'La contraseña no puede superar 128 caracteres.')
});

export type LoginCredentials = z.output<typeof loginCredentialsSchema>;
