import { createHash } from 'node:crypto';
import type { Clock } from '#lib/shared/time/clock.ts';
import type { LoginCredentials } from '../application/dto/login-credentials';
import type { AuthGateway } from '../application/ports';
import type { TokenSet } from '../domain/session';

/** Tiempo durante el que se reutiliza el resultado de una rotación ya completada. */
const DEFAULT_GRACE_PERIOD_MS = 10_000;
/** Cota de memoria: por encima no se deduplica (se degrada a llamar directamente). */
const MAX_TRACKED_REFRESHES = 10_000;

interface RefreshEntry {
	readonly result: Promise<TokenSet>;
	/** `null` mientras la llamada está en curso. */
	reusableUntil: number | null;
}

/**
 * Decorador de `AuthGateway` que evita rotar dos veces el mismo refresh token.
 *
 * El problema: la API rota el refresh token en cada uso y, si recibe uno ya usado, lo trata
 * como robado y **revoca toda la sesión** (detección de reutilización). Cuando el access token
 * caduca y el navegador lanza varias peticiones a la vez (precarga de datos, pestañas,
 * formularios), todas llegarían con el mismo refresh token y el usuario perdería la sesión.
 *
 * La solución: las llamadas concurrentes con el mismo token comparten una única petición a la
 * API, y su resultado se reutiliza unos segundos para las que llegan justo después con la cookie
 * antigua. Los fallos no se reutilizan. Las claves son hashes SHA-256, no los tokens.
 *
 * Limitación: es memoria del proceso. Con varias réplicas del frontend hace falta afinidad de
 * sesión (sticky sessions) o un almacén compartido (p. ej. Redis) con la misma lógica.
 */
export class SingleFlightAuthGateway implements AuthGateway {
	private readonly refreshes = new Map<string, RefreshEntry>();

	constructor(
		private readonly inner: AuthGateway,
		private readonly clock: Clock,
		private readonly gracePeriodMs = DEFAULT_GRACE_PERIOD_MS
	) {}

	login(credentials: LoginCredentials): Promise<TokenSet> {
		return this.inner.login(credentials);
	}

	logout(refreshToken: string): Promise<void> {
		this.refreshes.delete(hashOf(refreshToken));
		return this.inner.logout(refreshToken);
	}

	refresh(refreshToken: string): Promise<TokenSet> {
		this.evictExpiredEntries();
		const key = hashOf(refreshToken);
		const existing = this.refreshes.get(key);
		if (existing) {
			return existing.result;
		}
		if (this.refreshes.size >= MAX_TRACKED_REFRESHES) {
			return this.inner.refresh(refreshToken);
		}
		return this.track(key, this.inner.refresh(refreshToken));
	}

	private track(key: string, result: Promise<TokenSet>): Promise<TokenSet> {
		const entry: RefreshEntry = { result, reusableUntil: null };
		this.refreshes.set(key, entry);
		result.then(
			() => {
				entry.reusableUntil = this.clock.now().getTime() + this.gracePeriodMs;
			},
			() => {
				// El error lo gestiona quien llamó; aquí solo se evita reutilizar un fallo.
				this.refreshes.delete(key);
			}
		);
		return result;
	}

	private evictExpiredEntries(): void {
		const now = this.clock.now().getTime();
		for (const [key, entry] of this.refreshes) {
			if (entry.reusableUntil !== null && entry.reusableUntil <= now) {
				this.refreshes.delete(key);
			}
		}
	}
}

function hashOf(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}
