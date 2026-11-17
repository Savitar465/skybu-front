import type { Clock } from '#lib/shared/time/clock.ts';
import type { Logger } from '#lib/shared/logging/logger.ts';
import type { LoginCredentials } from '../application/dto/login-credentials';
import type { AccessTokenDecoder, AuthGateway, SessionStorage } from '../application/ports';
import type { Principal } from '../domain/principal';
import type { AccessTokenClaims, StoredTokens, TokenSet } from '../domain/session';

/** Dobles en memoria de los puertos del módulo, para tests sin red ni SvelteKit. */

export const NOW = new Date('2026-01-01T12:00:00Z');

export const principal: Principal = {
	userId: '00000000-0000-4000-8000-000000000001',
	tenantId: '00000000-0000-4000-8000-0000000000aa',
	email: 'ana@empresa.test',
	permissions: ['iam:roles:read']
};

export function fixedClock(at: Date = NOW): Clock {
	return { now: () => at };
}

export function tokenSet(
	suffix: string,
	accessExpiresAt = new Date(NOW.getTime() + 15 * 60_000)
): TokenSet {
	return {
		accessToken: `access-${suffix}`,
		accessTokenExpiresAt: accessExpiresAt,
		refreshToken: `refresh-${suffix}`,
		refreshTokenExpiresAt: new Date(NOW.getTime() + 7 * 24 * 3_600_000)
	};
}

export class InMemorySessionStorage implements SessionStorage {
	saved: TokenSet | null = null;
	cleared = false;

	constructor(private stored: StoredTokens = { accessToken: null, refreshToken: null }) {}

	load(): StoredTokens {
		return this.stored;
	}

	save(tokens: TokenSet): void {
		this.saved = tokens;
		this.stored = { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
	}

	clear(): void {
		this.cleared = true;
		this.stored = { accessToken: null, refreshToken: null };
	}
}

/** Decodificador que entiende tokens `access-*` y caducan según el mapa `expiresAt`. */
export class FakeTokenDecoder implements AccessTokenDecoder {
	constructor(private readonly expiresAtByToken: Record<string, Date> = {}) {}

	decode(accessToken: string): AccessTokenClaims | null {
		if (!accessToken.startsWith('access-')) {
			return null;
		}
		const expiresAt = this.expiresAtByToken[accessToken] ?? new Date(NOW.getTime() + 15 * 60_000);
		return { principal, expiresAt };
	}
}

/** Gateway programable: cada método ejecuta la función que se le asigne y registra las llamadas. */
export class StubAuthGateway implements AuthGateway {
	readonly calls = {
		login: [] as LoginCredentials[],
		refresh: [] as string[],
		logout: [] as string[]
	};
	onLogin: (credentials: LoginCredentials) => Promise<TokenSet> = async () => tokenSet('login');
	onRefresh: (refreshToken: string) => Promise<TokenSet> = async () => tokenSet('refreshed');
	onLogout: (refreshToken: string) => Promise<void> = async () => undefined;

	login(credentials: LoginCredentials): Promise<TokenSet> {
		this.calls.login.push(credentials);
		return this.onLogin(credentials);
	}

	refresh(refreshToken: string): Promise<TokenSet> {
		this.calls.refresh.push(refreshToken);
		return this.onRefresh(refreshToken);
	}

	logout(refreshToken: string): Promise<void> {
		this.calls.logout.push(refreshToken);
		return this.onLogout(refreshToken);
	}
}

export class RecordingLogger implements Logger {
	readonly warnings: string[] = [];
	readonly errors: string[] = [];

	info(): void {}

	warn(message: string): void {
		this.warnings.push(message);
	}

	error(message: string): void {
		this.errors.push(message);
	}
}
