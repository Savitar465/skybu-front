import { Permissions, type Permission } from '#lib/modules/auth/domain/permissions.ts';
import type { SalesOrderTransition } from '../domain/sales-order';

/**
 * Permiso que exige cada transición, igual que en `SalesOrderController`. Confirmar y cancelar
 * son permisos aparte de editar porque comprometen a la empresa (y al inventario): pueden
 * reservarse a un rol distinto del que cotiza.
 */
export const TRANSITION_PERMISSIONS: Readonly<Record<SalesOrderTransition, Permission>> = {
	send: Permissions.sales.ordersWrite,
	reopen: Permissions.sales.ordersWrite,
	confirm: Permissions.sales.ordersConfirm,
	cancel: Permissions.sales.ordersCancel
};
