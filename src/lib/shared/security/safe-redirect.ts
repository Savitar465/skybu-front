/** Destino por defecto tras iniciar sesión o cuando el destino pedido no es seguro. */
export const DEFAULT_AUTHENTICATED_PATH = '/';

const MAX_REDIRECT_LENGTH = 2048;

/**
 * Devuelve `target` solo si es una ruta relativa de esta misma aplicación; si no, la ruta por
 * defecto. Evita las redirecciones abiertas (open redirect): un enlace de phishing del tipo
 * `/login?redirectTo=https://evil.example` no debe llevar al usuario fuera de la aplicación
 * después de autenticarse.
 *
 * Se rechazan también `//host` y `/\host`, que los navegadores interpretan como URL absolutas,
 * y cualquier carácter de control (p. ej. saltos de línea para inyectar cabeceras).
 */
export function toSafeRedirectPath(target: string | null | undefined): string {
	if (!target || target.length > MAX_REDIRECT_LENGTH) {
		return DEFAULT_AUTHENTICATED_PATH;
	}
	const startsWithSingleSlash = target.startsWith('/') && !/^\/[/\\]/.test(target);
	// eslint-disable-next-line no-control-regex -- se buscan precisamente caracteres de control.
	const hasControlCharacters = /[\u0000-\u001f\u007f]/.test(target);
	return startsWithSingleSlash && !hasControlCharacters ? target : DEFAULT_AUTHENTICATED_PATH;
}

/** Ruta de login que, tras autenticarse, devuelve al usuario a donde intentaba ir. */
export function loginPathFor(url: URL): string {
	const destination = toSafeRedirectPath(url.pathname + url.search);
	if (destination === DEFAULT_AUTHENTICATED_PATH) {
		return '/login';
	}
	return `/login?${new URLSearchParams({ redirectTo: destination })}`;
}
