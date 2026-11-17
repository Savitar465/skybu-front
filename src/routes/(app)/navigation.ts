import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';
import { Permissions } from '#lib/modules/auth/domain/permissions.ts';
import type { PermissionRequirement } from '#lib/modules/auth/domain/principal.ts';
import type { IconName } from '#lib/shared/ui/Icon.svelte';

/**
 * Navegación principal, agrupada por módulo (como en Odoo). Cada entrada declara el permiso que
 * exige su ruta: un enlace a una sección prohibida solo llevaría a un 403. Ocultarlo es una
 * ayuda de interfaz; la protección real está en `ROUTE_PERMISSION_RULES` y en la API.
 */
export interface NavItem {
	readonly label: string;
	readonly href: ResolvedPathname;
	readonly icon: IconName;
	readonly requirement: PermissionRequirement | null;
}

export interface NavSection {
	readonly title: string | null;
	readonly items: readonly NavItem[];
}

export const NAVIGATION: readonly NavSection[] = [
	{
		title: null,
		items: [{ label: 'Inicio', href: resolve('/(app)'), icon: 'home', requirement: null }]
	},
	{
		title: 'Ventas',
		items: [
			{
				label: 'Cotizaciones',
				href: resolve('/(app)/sales/quotations'),
				icon: 'document',
				requirement: Permissions.sales.ordersRead
			},
			{
				label: 'Pedidos de venta',
				href: resolve('/(app)/sales/orders'),
				icon: 'cart',
				requirement: Permissions.sales.ordersRead
			}
		]
	},
	{
		title: 'Catálogo',
		items: [
			{
				label: 'Productos',
				href: resolve('/(app)/catalog/products'),
				icon: 'box',
				requirement: Permissions.catalog.productsRead
			},
			{
				label: 'Categorías',
				href: resolve('/(app)/catalog/categories'),
				icon: 'tag',
				requirement: Permissions.catalog.productsRead
			}
		]
	},
	{
		title: 'Administración',
		items: [
			{
				label: 'Roles',
				href: resolve('/(app)/iam/roles'),
				icon: 'shield',
				requirement: Permissions.iam.rolesRead
			}
		]
	}
];

/** Una entrada está activa en su ruta y en las rutas que cuelgan de ella (detalle, edición...). */
export function isCurrentSection(item: NavItem, pathname: string): boolean {
	if (item.href === resolve('/(app)')) {
		return pathname === item.href;
	}
	return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
