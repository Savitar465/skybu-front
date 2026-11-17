import { describe, expect, it } from 'vitest';
import { loginPathFor, toSafeRedirectPath } from './safe-redirect';

describe('toSafeRedirectPath', () => {
	it.each(['/', '/iam/roles', '/sales-orders?page=2'])('acepta rutas internas: %s', (path) => {
		expect(toSafeRedirectPath(path)).toBe(path);
	});

	it.each([
		null,
		'',
		'https://evil.test',
		'//evil.test',
		'/\\evil.test',
		'javascript:alert(1)',
		'/ok\r\nSet-Cookie: x=1',
		`/${'a'.repeat(3000)}`
	])('rechaza destinos externos o peligrosos: %s', (target) => {
		expect(toSafeRedirectPath(target)).toBe('/');
	});
});

describe('loginPathFor', () => {
	it('conserva el destino original para volver tras iniciar sesión', () => {
		expect(loginPathFor(new URL('http://app.test/iam/roles?x=1'))).toBe(
			'/login?redirectTo=%2Fiam%2Froles%3Fx%3D1'
		);
	});

	it('no añade parámetro para la página de inicio', () => {
		expect(loginPathFor(new URL('http://app.test/'))).toBe('/login');
	});
});
