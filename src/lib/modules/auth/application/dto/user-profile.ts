/** Perfil del usuario autenticado (proyección de `UserView` del backend). */
export interface UserProfile {
	readonly id: string;
	readonly email: string;
	readonly fullName: string;
	readonly roles: readonly { readonly id: string; readonly name: string }[];
	readonly lastLoginAt: Date | null;
}
