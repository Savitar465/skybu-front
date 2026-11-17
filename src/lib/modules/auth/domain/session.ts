import type { Principal } from './principal';

/** Par de tokens emitido por `/auth/login` y `/auth/refresh`. Nunca sale del servidor. */
export interface TokenSet {
	readonly accessToken: string;
	readonly accessTokenExpiresAt: Date;
	readonly refreshToken: string;
	readonly refreshTokenExpiresAt: Date;
}

/** Tokens tal como se recuperan del almacenamiento; cualquiera puede faltar o haber caducado. */
export interface StoredTokens {
	readonly accessToken: string | null;
	readonly refreshToken: string | null;
}

/** Contenido verificado del access token. */
export interface AccessTokenClaims {
	readonly principal: Principal;
	readonly expiresAt: Date;
}

/**
 * Sesión resuelta para una petición. `accessToken` es solo para el servidor (llamadas a la
 * API); a la UI únicamente se le entrega `principal`.
 */
export interface AuthenticatedSession {
	readonly principal: Principal;
	readonly accessToken: string;
}

/**
 * Margen antes de la caducidad real a partir del cual se considera que el access token ya no
 * sirve. Evita que caduque entre que se lee y que la API lo valida (latencia, desfase de reloj).
 */
export const ACCESS_TOKEN_EXPIRY_MARGIN_MS = 30_000;

export function isUsableAt(claims: AccessTokenClaims, now: Date): boolean {
	return claims.expiresAt.getTime() - ACCESS_TOKEN_EXPIRY_MARGIN_MS > now.getTime();
}
