// See https://svelte.dev/docs/kit/types#app.d.ts
import type { Principal } from '#lib/modules/auth/domain/principal.ts';
import type { AuthenticatedSession } from '#lib/modules/auth/domain/session.ts';

declare global {
	namespace App {
		/** Forma de todo error que llega a la UI: mensaje seguro + código estable. */
		interface Error {
			message: string;
			code: string;
			/** Identificador para correlacionar con los logs del servidor (solo errores inesperados). */
			errorId?: string;
		}

		/** Estado por petición, solo en el servidor: nunca se serializa al navegador. */
		interface Locals {
			session: AuthenticatedSession | null;
			/** `true` si no se pudo resolver la sesión porque la API no estaba disponible. */
			sessionUnavailable: boolean;
		}

		interface PageData {
			/** Identidad del usuario, presente en las rutas autenticadas. Sin tokens. */
			principal?: Principal;
		}
	}
}

export {};
