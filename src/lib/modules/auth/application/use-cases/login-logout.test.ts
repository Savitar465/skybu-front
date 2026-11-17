import { describe, expect, it } from 'vitest';
import {
	ServiceUnavailableError,
	UnauthenticatedError,
	UpstreamError
} from '#lib/shared/errors/app-error.ts';
import {
	FakeTokenDecoder,
	InMemorySessionStorage,
	RecordingLogger,
	StubAuthGateway,
	principal,
	tokenSet
} from '../../testing/fakes';
import { LoginUseCase } from './login';
import { LogoutUseCase } from './logout';

const credentials = { email: 'ana@empresa.test', password: 'secreta-123' };

describe('LoginUseCase', () => {
	it('guarda los tokens y devuelve la identidad del usuario', async () => {
		const storage = new InMemorySessionStorage();
		const useCase = new LoginUseCase(new StubAuthGateway(), storage, new FakeTokenDecoder());

		const result = await useCase.execute(credentials);

		expect(result).toEqual(principal);
		expect(storage.saved).toEqual(tokenSet('login'));
	});

	it('propaga las credenciales inválidas sin guardar nada', async () => {
		const gateway = new StubAuthGateway();
		gateway.onLogin = () => Promise.reject(new UnauthenticatedError('invalid_credentials'));
		const storage = new InMemorySessionStorage();
		const useCase = new LoginUseCase(gateway, storage, new FakeTokenDecoder());

		await expect(useCase.execute(credentials)).rejects.toMatchObject({
			code: 'invalid_credentials'
		});
		expect(storage.saved).toBeNull();
	});

	it('rechaza un token ilegible emitido por la API como error de integración', async () => {
		const gateway = new StubAuthGateway();
		gateway.onLogin = async () => ({ ...tokenSet('login'), accessToken: 'ilegible' });
		const storage = new InMemorySessionStorage();
		const useCase = new LoginUseCase(gateway, storage, new FakeTokenDecoder());

		await expect(useCase.execute(credentials)).rejects.toBeInstanceOf(UpstreamError);
		expect(storage.saved).toBeNull();
	});
});

describe('LogoutUseCase', () => {
	it('borra la sesión local y revoca el refresh token en la API', async () => {
		const gateway = new StubAuthGateway();
		const storage = new InMemorySessionStorage({
			accessToken: 'access-a',
			refreshToken: 'refresh-a'
		});

		await new LogoutUseCase(gateway, storage, new RecordingLogger()).execute();

		expect(storage.cleared).toBe(true);
		expect(gateway.calls.logout).toEqual(['refresh-a']);
	});

	it('cierra la sesión local aunque la API no esté disponible', async () => {
		const gateway = new StubAuthGateway();
		gateway.onLogout = () => Promise.reject(new ServiceUnavailableError());
		const storage = new InMemorySessionStorage({
			accessToken: 'access-a',
			refreshToken: 'refresh-a'
		});
		const logger = new RecordingLogger();

		await new LogoutUseCase(gateway, storage, logger).execute();

		expect(storage.cleared).toBe(true);
		expect(logger.warnings).toHaveLength(1);
	});

	it('no llama a la API si no hay refresh token', async () => {
		const gateway = new StubAuthGateway();

		await new LogoutUseCase(gateway, new InMemorySessionStorage(), new RecordingLogger()).execute();

		expect(gateway.calls.logout).toHaveLength(0);
	});
});
