import type { Permission } from './permissions';

/**
 * Identidad del usuario autenticado tal y como la emite el backend en el access token.
 * Es serializable (se envía al navegador en los datos de la página) y no contiene secretos.
 */
export interface Principal {
	readonly userId: string;
	readonly tenantId: string;
	readonly email: string;
	readonly permissions: readonly string[];
}

/** Requisito de autorización: un permiso, o una lista de la que basta (`any`) o hacen falta todos (`all`). */
export type PermissionRequirement =
	| Permission
	| { readonly anyOf: readonly Permission[] }
	| { readonly allOf: readonly Permission[] };

export function hasPermission(
	principal: Principal | null | undefined,
	permission: Permission
): boolean {
	return principal?.permissions.includes(permission) ?? false;
}

/**
 * Evalúa un requisito de autorización. Una lista vacía nunca concede acceso: denegar por
 * defecto evita que un error de configuración abra una ruta a cualquiera.
 */
export function satisfies(
	principal: Principal | null | undefined,
	requirement: PermissionRequirement
): boolean {
	if (!principal) {
		return false;
	}
	if (typeof requirement === 'string') {
		return hasPermission(principal, requirement);
	}
	if ('anyOf' in requirement) {
		return requirement.anyOf.some((permission) => hasPermission(principal, permission));
	}
	return (
		requirement.allOf.length > 0 &&
		requirement.allOf.every((permission) => hasPermission(principal, permission))
	);
}
