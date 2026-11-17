/**
 * Cabeceras de seguridad para todas las respuestas. La Content-Security-Policy la gestiona
 * SvelteKit (`csp` en `vite.config.ts`) porque necesita añadir nonces a sus scripts inline.
 */
const SECURITY_HEADERS: Readonly<Record<string, string>> = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
	'Cross-Origin-Opener-Policy': 'same-origin'
};

export function applySecurityHeaders(
	response: Response,
	{ authenticated }: { authenticated: boolean }
): void {
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(name, value);
	}
	if (authenticated) {
		// Las páginas con datos de un usuario no se guardan en cachés compartidas ni en el
		// historial: tras cerrar sesión, "atrás" no debe mostrar datos de la sesión anterior.
		response.headers.set('Cache-Control', 'private, no-store');
	}
}
