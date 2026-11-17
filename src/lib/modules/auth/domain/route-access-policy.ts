import { satisfies, type PermissionRequirement, type Principal } from './principal';

/** Regla de autorización asociada a una rama de rutas (por `route.id` de SvelteKit). */
export interface RoutePermissionRule {
	/** Prefijo de `route.id`, p. ej. `/(app)/iam/roles`. Se compara por segmentos completos. */
	readonly routeIdPrefix: string;
	readonly requirement: PermissionRequirement;
}

export type RouteAccessDecision =
	| { readonly kind: 'allow' }
	| { readonly kind: 'require-login' }
	| { readonly kind: 'redirect-authenticated' }
	| { readonly kind: 'forbidden' };

/** Rutas accesibles para todos, con o sin sesión. */
export const PUBLIC_ROUTE_GROUP = '/(public)';
/** Rutas solo para visitantes sin sesión (login): un usuario autenticado se redirige a la app. */
export const GUEST_ROUTE_GROUP = '/(guest)';

const ALLOW: RouteAccessDecision = { kind: 'allow' };

/**
 * Política de acceso a rutas, centralizada y **denegando por defecto**: toda ruta fuera de los
 * grupos `(public)` y `(guest)` exige sesión, y además el permiso de la regla más específica
 * que le corresponda.
 *
 * Se evalúa en el hook del servidor para cada petición (páginas, acciones de formulario y
 * endpoints), no en los `load` de los layouts: un guard en un layout no protege las acciones
 * ni los `+server.ts`, y es fácil olvidarlo en una página nueva.
 */
export class RouteAccessPolicy {
	private readonly rulesByPrecedence: readonly RoutePermissionRule[];

	constructor(rules: readonly RoutePermissionRule[]) {
		// La regla más específica (el prefijo más largo) gana.
		this.rulesByPrecedence = [...rules].sort(
			(a, b) => b.routeIdPrefix.length - a.routeIdPrefix.length
		);
	}

	evaluate(routeId: string | null, principal: Principal | null): RouteAccessDecision {
		// Sin ruta coincidente SvelteKit responderá 404; no hay nada que proteger.
		if (routeId === null || isInGroup(routeId, PUBLIC_ROUTE_GROUP)) {
			return ALLOW;
		}
		if (isInGroup(routeId, GUEST_ROUTE_GROUP)) {
			return principal ? { kind: 'redirect-authenticated' } : ALLOW;
		}
		if (!principal) {
			return { kind: 'require-login' };
		}
		const rule = this.rulesByPrecedence.find((candidate) =>
			isInGroup(routeId, candidate.routeIdPrefix)
		);
		if (rule && !satisfies(principal, rule.requirement)) {
			return { kind: 'forbidden' };
		}
		return ALLOW;
	}
}

function isInGroup(routeId: string, prefix: string): boolean {
	return routeId === prefix || routeId.startsWith(`${prefix}/`);
}
