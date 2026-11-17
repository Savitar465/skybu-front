import { UpstreamError } from '#lib/shared/errors/app-error.ts';
import type { Principal } from '../../domain/principal';
import type { LoginCredentials } from '../dto/login-credentials';
import type { AccessTokenDecoder, AuthGateway, SessionStorage } from '../ports';

/**
 * Inicia sesión: obtiene el par de tokens de la API, comprueba que el access token es legible
 * y lo guarda. Si las credenciales no son válidas, la API responde 401 y el gateway lanza
 * `UnauthenticatedError` (`invalid_credentials`), que se propaga sin tocar el almacén.
 */
export class LoginUseCase {
	constructor(
		private readonly authGateway: AuthGateway,
		private readonly sessionStorage: SessionStorage,
		private readonly tokenDecoder: AccessTokenDecoder
	) {}

	async execute(credentials: LoginCredentials): Promise<Principal> {
		const tokens = await this.authGateway.login(credentials);
		const claims = this.tokenDecoder.decode(tokens.accessToken);
		if (!claims) {
			// La API emitió un token que no se puede leer: es un fallo de integración, no del usuario.
			throw new UpstreamError();
		}
		this.sessionStorage.save(tokens);
		return claims.principal;
	}
}
