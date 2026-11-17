import { z } from 'zod';
import type { AccessTokenDecoder } from '../application/ports';
import { PERMISSION_CODE_PATTERN } from '../domain/permissions';
import type { AccessTokenClaims } from '../domain/session';

const MAX_TOKEN_LENGTH = 8192;
const MAX_PERMISSIONS = 500;
const SECONDS_TO_MS = 1000;

/** Claims que emite `JwtAccessTokenIssuer` en el backend. */
const claimsSchema = z.object({
	sub: z.uuid(),
	tenant_id: z.uuid(),
	email: z.string().max(254),
	permissions: z.array(z.string().max(100).regex(PERMISSION_CODE_PATTERN)).max(MAX_PERMISSIONS),
	exp: z.number().int().positive()
});

/**
 * Lee (decodifica y valida la forma de) los claims del access token.
 *
 * **No verifica la firma**, y es una decisión deliberada: la firma es HMAC con un secreto que
 * solo debe conocer la API (compartirlo permitiría al frontend emitir tokens). La API verifica
 * firma, emisor y caducidad en cada llamada, que es donde se protegen los datos. Aquí los
 * claims solo deciden qué mostrar y por qué rutas navegar; además, el token llega desde una
 * cookie httpOnly que el propio servidor escribió con lo que devolvió la API.
 */
export class JwtAccessTokenDecoder implements AccessTokenDecoder {
	decode(accessToken: string): AccessTokenClaims | null {
		const payload = readPayloadSegment(accessToken);
		if (payload === null) {
			return null;
		}
		const claims = claimsSchema.safeParse(parseJson(payload));
		if (!claims.success) {
			return null;
		}
		return {
			principal: {
				userId: claims.data.sub,
				tenantId: claims.data.tenant_id,
				email: claims.data.email,
				permissions: claims.data.permissions
			},
			expiresAt: new Date(claims.data.exp * SECONDS_TO_MS)
		};
	}
}

function readPayloadSegment(token: string): string | null {
	if (token.length > MAX_TOKEN_LENGTH) {
		return null;
	}
	const segments = token.split('.');
	if (segments.length !== 3 || !/^[A-Za-z0-9_-]+$/.test(segments[1])) {
		return null;
	}
	return Buffer.from(segments[1], 'base64url').toString('utf8');
}

function parseJson(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch (error) {
		if (error instanceof SyntaxError) {
			return null;
		}
		throw error;
	}
}
