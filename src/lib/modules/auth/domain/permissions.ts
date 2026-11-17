/**
 * Catálogo de permisos del backend (convención `<módulo>:<recurso>:<acción>`), replicado para
 * poder referenciarlos con nombre en la UI en lugar de con cadenas sueltas.
 *
 * Importante: en el frontend los permisos solo deciden qué se muestra y a qué rutas se deja
 * navegar. La autorización real la hace la API en cada petición (`@PreAuthorize`).
 */
export const Permissions = {
	iam: {
		usersRead: 'iam:users:read',
		usersManage: 'iam:users:manage',
		rolesRead: 'iam:roles:read',
		rolesManage: 'iam:roles:manage',
		tenantsManage: 'iam:tenants:manage'
	},
	catalog: {
		productsRead: 'catalog:products:read',
		productsManage: 'catalog:products:manage',
		categoriesManage: 'catalog:categories:manage'
	},
	customers: {
		customersRead: 'customers:customers:read',
		customersManage: 'customers:customers:manage'
	},
	sales: {
		ordersRead: 'sales:orders:read',
		ordersWrite: 'sales:orders:write',
		ordersConfirm: 'sales:orders:confirm',
		ordersCancel: 'sales:orders:cancel'
	},
	billing: {
		invoicesRead: 'billing:invoices:read',
		invoicesIssue: 'billing:invoices:issue',
		invoicesVoid: 'billing:invoices:void',
		paymentsRegister: 'billing:payments:register',
		paymentsVoid: 'billing:payments:void',
		fiscalProfileRead: 'billing:fiscal-profile:read',
		fiscalProfileManage: 'billing:fiscal-profile:manage'
	}
} as const;

type ValuesOf<T> = T[keyof T];

/** Unión de todos los códigos de permiso conocidos. */
export type Permission = ValuesOf<{
	[Module in keyof typeof Permissions]: ValuesOf<(typeof Permissions)[Module]>;
}>;

/**
 * Formato de un código de permiso. Se valida al leer el token: el backend puede añadir
 * permisos nuevos antes que el frontend, así que no se rechazan los desconocidos, solo los
 * malformados.
 */
export const PERMISSION_CODE_PATTERN = /^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$/;
