import { Permissions } from '../domain/permissions';
import type { RoutePermissionRule } from '../domain/route-access-policy';

/**
 * Permiso que exige cada rama de rutas protegidas. Toda ruta del grupo `(app)` exige ya sesión;
 * aquí solo se añaden los permisos finos. Al crear una sección nueva se registra aquí su regla
 * (una sola línea) en lugar de repetir guards en cada `load` y en cada acción.
 *
 * Las acciones que exigen un permiso distinto del de la página (p. ej. leer vs. gestionar) se
 * comprueban además en la propia acción con `requirePermission`.
 */
export const ROUTE_PERMISSION_RULES: readonly RoutePermissionRule[] = [
	{ routeIdPrefix: '/(app)/iam/roles', requirement: Permissions.iam.rolesRead }
];
