import { describe, expect, it } from 'vitest';
import { JwtAccessTokenDecoder } from './jwt-access-token-decoder';

const decoder = new JwtAccessTokenDecoder();

function jwtWith(payload: unknown): string {
	const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
	return `${encode({ alg: 'HS256' })}.${encode(payload)}.firma`;
}

const validClaims = {
	sub: '00000000-0000-4000-8000-000000000001',
	tenant_id: '00000000-0000-4000-8000-0000000000aa',
	email: 'ana@empresa.test',
	permissions: ['iam:roles:read', 'sales:orders:write'],
	exp: 1_767_270_000
};

describe('JwtAccessTokenDecoder', () => {
	it('lee la identidad y la caducidad del token', () => {
		const claims = decoder.decode(jwtWith(validClaims));

		expect(claims).toEqual({
			principal: {
				userId: validClaims.sub,
				tenantId: validClaims.tenant_id,
				email: validClaims.email,
				permissions: validClaims.permissions
			},
			expiresAt: new Date(validClaims.exp * 1000)
		});
	});

	it.each([
		['sin empresa', { ...validClaims, tenant_id: undefined }],
		['permiso malformado', { ...validClaims, permissions: ['<script>'] }],
		['caducidad no numérica', { ...validClaims, exp: 'mañana' }]
	])('rechaza claims inválidos: %s', (_case, payload) => {
		expect(decoder.decode(jwtWith(payload))).toBeNull();
	});

	it.each(['', 'a.b', 'a.!!!.c', `a.${'x'.repeat(9000)}.c`, 'a.bm90LWpzb24.c'])(
		'rechaza tokens malformados: %#',
		(token) => {
			expect(decoder.decode(token)).toBeNull();
		}
	);
});
