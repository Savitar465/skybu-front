import { page } from '$app/state';
import { satisfies, type PermissionRequirement, type Principal } from '../domain/principal';

/**
 * Helpers de autorización para componentes. Leen la identidad de los datos de la página, por lo
 * que son reactivos al usarse en plantillas o `$derived`.
 *
 * Solo deciden qué se muestra: ocultar un botón no protege nada. La API y el hook del servidor
 * son los que deniegan de verdad.
 */
export function currentPrincipal(): Principal | null {
	return page.data.principal ?? null;
}

export function can(requirement: PermissionRequirement): boolean {
	return satisfies(currentPrincipal(), requirement);
}
