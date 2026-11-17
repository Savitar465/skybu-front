import { z } from 'zod';
import type { HttpClient } from '#lib/server/http/http-client.ts';
import type { LoginCredentials } from '../application/dto/login-credentials';
import type { AuthGateway } from '../application/ports';
import type { TokenSet } from '../domain/session';

const isoInstant = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

/** Contrato de `TokenResponse` del backend. Se valida antes de guardar nada. */
const tokenResponseSchema = z
	.object({
		tokenType: z.literal('Bearer'),
		accessToken: z.string().min(1).max(8192),
		accessTokenExpiresAt: isoInstant,
		refreshToken: z.string().min(1).max(128),
		refreshTokenExpiresAt: isoInstant
	})
	.transform((response): TokenSet => ({
		accessToken: response.accessToken,
		accessTokenExpiresAt: response.accessTokenExpiresAt,
		refreshToken: response.refreshToken,
		refreshTokenExpiresAt: response.refreshTokenExpiresAt
	}));

/** Adaptador de `AuthGateway` sobre `/api/v1/auth/*`. */
export class HttpAuthGateway implements AuthGateway {
	constructor(private readonly httpClient: HttpClient) {}

	login(credentials: LoginCredentials): Promise<TokenSet> {
		return this.httpClient.send({
			method: 'POST',
			path: '/api/v1/auth/login',
			body: { email: credentials.email, password: credentials.password },
			responseSchema: tokenResponseSchema
		});
	}

	refresh(refreshToken: string): Promise<TokenSet> {
		return this.httpClient.send({
			method: 'POST',
			path: '/api/v1/auth/refresh',
			body: { refreshToken },
			responseSchema: tokenResponseSchema
		});
	}

	logout(refreshToken: string): Promise<void> {
		return this.httpClient.send({
			method: 'POST',
			path: '/api/v1/auth/logout',
			body: { refreshToken },
			responseSchema: null
		});
	}
}
