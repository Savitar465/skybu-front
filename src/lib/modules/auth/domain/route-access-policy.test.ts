import { describe, expect, it } from 'vitest';
import { principal } from '../testing/fakes';
import { Permissions } from './permissions';
import { satisfies } from './principal';
import { RouteAccessPolicy } from './route-access-policy';

const policy = new RouteAccessPolicy([
	{ routeIdPrefix: '/(app)/iam', requirement: Permissions.iam.usersRead },
	{ routeIdPrefix: '/(app)/iam/roles', requirement: Permissions.iam.rolesRead }
]);

describe('RouteAccessPolicy', () => {
	it('exige sesión por defecto en cualquier ruta fuera de los grupos públicos', () => {
		expect(policy.evaluate('/(app)', null)).toEqual({ kind: 'require-login' });
		expect(policy.evaluate('/reports', null)).toEqual({ kind: 'require-login' });
	});

	it('permite las rutas públicas con y sin sesión', () => {
		expect(policy.evaluate('/(public)/logout', null)).toEqual({ kind: 'allow' });
		expect(policy.evaluate('/(public)/logout', principal)).toEqual({ kind: 'allow' });
	});

	it('redirige al usuario autenticado fuera de las rutas de invitado', () => {
		expect(policy.evaluate('/(guest)/login', null)).toEqual({ kind: 'allow' });
		expect(policy.evaluate('/(guest)/login', principal)).toEqual({
			kind: 'redirect-authenticated'
		});
	});

	it('aplica la regla más específica', () => {
		// `principal` tiene `iam:roles:read` pero no `iam:users:read`.
		expect(policy.evaluate('/(app)/iam/roles/[roleId]', principal)).toEqual({ kind: 'allow' });
		expect(policy.evaluate('/(app)/iam/users', principal)).toEqual({ kind: 'forbidden' });
	});

	it('compara prefijos por segmentos completos', () => {
		const strict = new RouteAccessPolicy([
			{ routeIdPrefix: '/(app)/iam/roles', requirement: Permissions.iam.rolesManage }
		]);
		expect(strict.evaluate('/(app)/iam/roles-archive', principal)).toEqual({ kind: 'allow' });
		expect(strict.evaluate('/(app)/iam/roles', principal)).toEqual({ kind: 'forbidden' });
	});

	it('deja pasar rutas inexistentes para que respondan 404', () => {
		expect(policy.evaluate(null, null)).toEqual({ kind: 'allow' });
	});
});

describe('satisfies', () => {
	it('evalúa requisitos simples, anyOf y allOf', () => {
		expect(satisfies(principal, Permissions.iam.rolesRead)).toBe(true);
		expect(
			satisfies(principal, { anyOf: [Permissions.iam.rolesManage, Permissions.iam.rolesRead] })
		).toBe(true);
		expect(
			satisfies(principal, { allOf: [Permissions.iam.rolesManage, Permissions.iam.rolesRead] })
		).toBe(false);
	});

	it('deniega sin identidad y con listas vacías', () => {
		expect(satisfies(null, Permissions.iam.rolesRead)).toBe(false);
		expect(satisfies(principal, { anyOf: [] })).toBe(false);
		expect(satisfies(principal, { allOf: [] })).toBe(false);
	});
});
