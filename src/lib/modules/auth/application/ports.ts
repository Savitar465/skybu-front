import type { AccessTokenClaims, StoredTokens, TokenSet } from '../domain/session';
import type { LoginCredentials } from './dto/login-credentials';
import type { RoleSummary } from './dto/role-summary';
import type { UserProfile } from './dto/user-profile';

/**
 * Puertos de salida del módulo. Los casos de uso dependen solo de estas interfaces; las
 * implementaciones (HTTP, cookies, JWT) viven en `server/` y se conectan en la raíz de
 * composición. En los tests se sustituyen por dobles en memoria.
 */

/** Endpoints de autenticación de la API (`/api/v1/auth/*`). */
export interface AuthGateway {
	login(credentials: LoginCredentials): Promise<TokenSet>;
	/** Rota el refresh token: el presentado queda revocado y se emite un par nuevo. */
	refresh(refreshToken: string): Promise<TokenSet>;
	/** Revoca la familia del refresh token (todas sus rotaciones). */
	logout(refreshToken: string): Promise<void>;
}

/** Cuenta del usuario autenticado (`/api/v1/account`). */
export interface AccountGateway {
	getProfile(accessToken: string): Promise<UserProfile>;
	changePassword(accessToken: string, currentPassword: string, newPassword: string): Promise<void>;
}

/** Roles de la empresa del usuario (`/api/v1/roles`). */
export interface RoleDirectory {
	list(accessToken: string): Promise<readonly RoleSummary[]>;
}

/** Almacén de los tokens de la sesión del navegador actual (en producción, cookies httpOnly). */
export interface SessionStorage {
	load(): StoredTokens;
	save(tokens: TokenSet): void;
	clear(): void;
}

/** Lee los claims del access token. Devuelve `null` si el token está malformado. */
export interface AccessTokenDecoder {
	decode(accessToken: string): AccessTokenClaims | null;
}
