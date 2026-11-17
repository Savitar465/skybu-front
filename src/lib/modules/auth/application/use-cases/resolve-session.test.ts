import { describe, expect, it } from 'vitest';
import {
	ServiceUnavailableError,
	UnauthenticatedError,
	ValidationError
} from '#lib/shared/errors/app-error.ts';
import {
	FakeTokenDecoder,
	InMemorySessionStorage,
	NOW,
	StubAuthGateway,
	fixedClock,
	principal
} from '../../testing/fakes';
import { ResolveSessionUseCase } from './resolve-session';

function setup(
	stored: { accessToken: string | null; refreshToken: string | null },
	expiresAt = {}
) {
	const gateway = new StubAuthGateway();
	const storage = new InMemorySessionStorage(stored);
	const useCase = new ResolveSessionUseCase(
		gateway,
		storage,
		new FakeTokenDecoder(expiresAt),
		fixedClock()
	);
	return { gateway, storage, useCase };
}

describe('ResolveSessionUseCase', () => {
	it('usa el access token vigente sin llamar a la API', async () => {
		const { gateway, useCase } = setup({
			accessToken: 'access-current',
			refreshToken: 'refresh-current'
		});

		const session = await useCase.execute();

		expect(session).toEqual({ principal, accessToken: 'access-current' });
		expect(gateway.calls.refresh).toHaveLength(0);
	});

	it('devuelve null sin tocar nada cuando no hay tokens', async () => {
		const { storage, useCase } = setup({ accessToken: null, refreshToken: null });

		expect(await useCase.execute()).toBeNull();
		expect(storage.cleared).toBe(false);
	});

	it('renueva la sesión cuando el access token está a punto de caducar', async () => {
		const almostExpired = new Date(NOW.getTime() + 10_000);
		const { gateway, storage, useCase } = setup(
			{ accessToken: 'access-old', refreshToken: 'refresh-old' },
			{ 'access-old': almostExpired }
		);

		const session = await useCase.execute();

		expect(gateway.calls.refresh).toEqual(['refresh-old']);
		expect(storage.saved?.accessToken).toBe('access-refreshed');
		expect(session?.accessToken).toBe('access-refreshed');
	});

	it('renueva la sesión cuando solo queda el refresh token', async () => {
		const { gateway, useCase } = setup({ accessToken: null, refreshToken: 'refresh-old' });

		await useCase.execute();

		expect(gateway.calls.refresh).toEqual(['refresh-old']);
	});

	it('borra la sesión si la API rechaza el refresh token', async () => {
		const { gateway, storage, useCase } = setup({
			accessToken: null,
			refreshToken: 'refresh-revoked'
		});
		gateway.onRefresh = () =>
			Promise.reject(new UnauthenticatedError('refresh_token_reuse_detected'));

		expect(await useCase.execute()).toBeNull();
		expect(storage.cleared).toBe(true);
	});

	it('borra la sesión si la cookie del refresh token fue manipulada (400)', async () => {
		const { gateway, storage, useCase } = setup({
			accessToken: null,
			refreshToken: 'x'.repeat(500)
		});
		gateway.onRefresh = () => Promise.reject(new ValidationError('inválido'));

		expect(await useCase.execute()).toBeNull();
		expect(storage.cleared).toBe(true);
	});

	it('conserva la sesión y propaga el error si la API no está disponible', async () => {
		const { gateway, storage, useCase } = setup({ accessToken: null, refreshToken: 'refresh-old' });
		gateway.onRefresh = () => Promise.reject(new ServiceUnavailableError());

		await expect(useCase.execute()).rejects.toBeInstanceOf(ServiceUnavailableError);
		expect(storage.cleared).toBe(false);
	});

	it('borra un access token ilegible cuando no hay refresh token', async () => {
		const { storage, useCase } = setup({ accessToken: 'garbage', refreshToken: null });

		expect(await useCase.execute()).toBeNull();
		expect(storage.cleared).toBe(true);
	});
});
