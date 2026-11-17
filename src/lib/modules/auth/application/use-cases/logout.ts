import {
	ServiceUnavailableError,
	UpstreamError,
	ValidationError
} from '#lib/shared/errors/app-error.ts';
import type { Logger } from '#lib/shared/logging/logger.ts';
import type { AuthGateway, SessionStorage } from '../ports';

/**
 * Cierra la sesión. Primero se borra la sesión local (el usuario queda desconectado pase lo que
 * pase) y después se revoca el refresh token en la API para que no pueda reutilizarse.
 *
 * Si la API no está disponible, el cierre local ya está hecho: se registra el aviso (el token
 * seguirá siendo válido en el servidor hasta su caducidad) y no se bloquea al usuario.
 */
export class LogoutUseCase {
	constructor(
		private readonly authGateway: AuthGateway,
		private readonly sessionStorage: SessionStorage,
		private readonly logger: Logger
	) {}

	async execute(): Promise<void> {
		const { refreshToken } = this.sessionStorage.load();
		this.sessionStorage.clear();
		if (!refreshToken) {
			return;
		}
		try {
			await this.authGateway.logout(refreshToken);
		} catch (error) {
			if (
				error instanceof ServiceUnavailableError ||
				error instanceof UpstreamError ||
				error instanceof ValidationError
			) {
				this.logger.warn('No se pudo revocar el refresh token en la API al cerrar sesión', {
					code: error.code
				});
				return;
			}
			throw error;
		}
	}
}
