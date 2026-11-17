import type { Cookies } from '@sveltejs/kit';
import type { SessionStorage } from '../application/ports';
import type { StoredTokens, TokenSet } from '../domain/session';

/**
 * Nombres de las cookies. En producción llevan el prefijo `__Host-`: el navegador solo las
 * acepta si son `Secure`, con `Path=/` y sin `Domain`, lo que impide que un subdominio
 * comprometido las sobrescriba (cookie tossing). En desarrollo (HTTP) no se puede usar.
 */
function cookieNames(secure: boolean) {
	const prefix = secure ? '__Host-' : '';
	return { accessToken: `${prefix}skybu_at`, refreshToken: `${prefix}skybu_rt` } as const;
}

/**
 * Guarda los tokens en cookies **httpOnly**: el JavaScript del navegador no puede leerlas, así
 * que un XSS no puede robar la sesión. Solo el servidor de SvelteKit (BFF) las usa para llamar
 * a la API.
 *
 * - `SameSite=Lax`: el navegador no las envía en peticiones POST iniciadas desde otros sitios
 *   (CSRF); SvelteKit además comprueba el `Origin` de todo envío de formulario.
 * - Cada cookie caduca a la vez que su token, así el navegador no conserva tokens inútiles.
 */
export class CookieSessionStorage implements SessionStorage {
	private readonly names: ReturnType<typeof cookieNames>;

	constructor(
		private readonly cookies: Cookies,
		private readonly secure: boolean
	) {
		this.names = cookieNames(secure);
	}

	load(): StoredTokens {
		return {
			accessToken: this.cookies.get(this.names.accessToken) || null,
			refreshToken: this.cookies.get(this.names.refreshToken) || null
		};
	}

	save(tokens: TokenSet): void {
		this.cookies.set(
			this.names.accessToken,
			tokens.accessToken,
			this.optionsUntil(tokens.accessTokenExpiresAt)
		);
		this.cookies.set(
			this.names.refreshToken,
			tokens.refreshToken,
			this.optionsUntil(tokens.refreshTokenExpiresAt)
		);
	}

	clear(): void {
		this.cookies.delete(this.names.accessToken, this.baseOptions());
		this.cookies.delete(this.names.refreshToken, this.baseOptions());
	}

	private optionsUntil(expiresAt: Date) {
		return { ...this.baseOptions(), expires: expiresAt };
	}

	private baseOptions() {
		return { path: '/', httpOnly: true, secure: this.secure, sameSite: 'lax' as const };
	}
}
