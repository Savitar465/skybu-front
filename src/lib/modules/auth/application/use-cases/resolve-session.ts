import {
	UnauthenticatedError,
	UpstreamError,
	ValidationError
} from '#lib/shared/errors/app-error.ts';
import type { Clock } from '#lib/shared/time/clock.ts';
import { isUsableAt, type AuthenticatedSession } from '../../domain/session';
import type { AccessTokenDecoder, AuthGateway, SessionStorage } from '../ports';

/**
 * Determina la sesión de la petición actual.
 *
 * 1. Si el access token guardado es legible y no está a punto de caducar, se usa tal cual.
 * 2. Si no, y hay refresh token, se rota (renovación silenciosa) y se guarda el nuevo par.
 * 3. Si la API rechaza el refresh token (caducado, revocado o reutilizado), se borra la sesión
 *    local y la petición continúa como anónima.
 *
 * Los errores de disponibilidad de la API (`ServiceUnavailableError`, `UpstreamError`) se
 * propagan: una caída del backend no debe cerrar la sesión del usuario.
 */
export class ResolveSessionUseCase {
	constructor(
		private readonly authGateway: AuthGateway,
		private readonly sessionStorage: SessionStorage,
		private readonly tokenDecoder: AccessTokenDecoder,
		private readonly clock: Clock
	) {}

	async execute(): Promise<AuthenticatedSession | null> {
		const stored = this.sessionStorage.load();
		const currentSession = stored.accessToken ? this.toUsableSession(stored.accessToken) : null;
		if (currentSession) {
			return currentSession;
		}
		if (!stored.refreshToken) {
			this.clearIfAnyTokenStored(stored.accessToken);
			return null;
		}
		return this.renewSession(stored.refreshToken);
	}

	private toUsableSession(accessToken: string): AuthenticatedSession | null {
		const claims = this.tokenDecoder.decode(accessToken);
		if (!claims || !isUsableAt(claims, this.clock.now())) {
			return null;
		}
		return { principal: claims.principal, accessToken };
	}

	private async renewSession(refreshToken: string): Promise<AuthenticatedSession | null> {
		try {
			const tokens = await this.authGateway.refresh(refreshToken);
			const claims = this.tokenDecoder.decode(tokens.accessToken);
			if (!claims) {
				throw new UpstreamError();
			}
			this.sessionStorage.save(tokens);
			return { principal: claims.principal, accessToken: tokens.accessToken };
		} catch (error) {
			// 401: token caducado/revocado/reutilizado. 400: cookie manipulada con un valor inválido.
			if (error instanceof UnauthenticatedError || error instanceof ValidationError) {
				this.sessionStorage.clear();
				return null;
			}
			throw error;
		}
	}

	private clearIfAnyTokenStored(accessToken: string | null): void {
		if (accessToken) {
			this.sessionStorage.clear();
		}
	}
}
