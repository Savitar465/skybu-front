/** Rol de la empresa con sus permisos (proyección de `RoleView` del backend). */
export interface RoleSummary {
	readonly id: string;
	readonly name: string;
	readonly description: string | null;
	readonly systemRole: boolean;
	readonly permissions: readonly string[];
}
