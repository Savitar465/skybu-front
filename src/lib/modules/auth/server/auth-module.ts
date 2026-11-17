import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/env';
import { apiHttpClient } from '#lib/server/api/api-http-client.ts';
import { consoleLogger } from '#lib/shared/logging/logger.ts';
import { systemClock } from '#lib/shared/time/clock.ts';
import { ChangePasswordUseCase } from '../application/use-cases/change-password';
import { GetCurrentProfileUseCase } from '../application/use-cases/get-current-profile';
import { ListRolesUseCase } from '../application/use-cases/list-roles';
import { LoginUseCase } from '../application/use-cases/login';
import { LogoutUseCase } from '../application/use-cases/logout';
import { ResolveSessionUseCase } from '../application/use-cases/resolve-session';
import { RouteAccessPolicy } from '../domain/route-access-policy';
import { CookieSessionStorage } from './cookie-session-storage';
import { HttpAccountGateway } from './http-account-gateway';
import { HttpAuthGateway } from './http-auth-gateway';
import { HttpRoleDirectory } from './http-role-directory';
import { JwtAccessTokenDecoder } from './jwt-access-token-decoder';
import { ROUTE_PERMISSION_RULES } from './route-permission-rules';
import { SingleFlightAuthGateway } from './single-flight-auth-gateway';

/**
 * Raíz de composición del módulo: el único lugar que conoce las implementaciones concretas.
 * Rutas y hooks piden aquí los casos de uso ya conectados; nunca instancian adaptadores.
 *
 * Los adaptadores sin estado por usuario son únicos por proceso (el decorador single-flight
 * debe serlo para funcionar). El almacén de sesión es por petición porque envuelve sus cookies.
 */
const authGateway = new SingleFlightAuthGateway(new HttpAuthGateway(apiHttpClient), systemClock);
const accountGateway = new HttpAccountGateway(apiHttpClient);
const tokenDecoder = new JwtAccessTokenDecoder();
const listRoles = new ListRolesUseCase(new HttpRoleDirectory(apiHttpClient));
/** Las cookies solo son `Secure` fuera de desarrollo (el servidor de desarrollo usa HTTP). */
const secureCookies = !dev;

export const routeAccessPolicy = new RouteAccessPolicy(ROUTE_PERMISSION_RULES);

export function authUseCasesFor(cookies: Cookies) {
	const sessionStorage = new CookieSessionStorage(cookies, secureCookies);
	return {
		login: new LoginUseCase(authGateway, sessionStorage, tokenDecoder),
		logout: new LogoutUseCase(authGateway, sessionStorage, consoleLogger),
		resolveSession: new ResolveSessionUseCase(
			authGateway,
			sessionStorage,
			tokenDecoder,
			systemClock
		),
		changePassword: new ChangePasswordUseCase(accountGateway, sessionStorage),
		getCurrentProfile: new GetCurrentProfileUseCase(accountGateway),
		listRoles,
		/** Para cuando la API invalida la sesión a mitad de petición (401 en una llamada cualquiera). */
		discardSession: () => sessionStorage.clear()
	};
}
