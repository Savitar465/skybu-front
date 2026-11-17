import type { ChangePasswordInput } from '../dto/change-password-input';
import type { AccountGateway, SessionStorage } from '../ports';

/**
 * Cambia la contraseña del usuario autenticado.
 *
 * La API revoca todos los refresh tokens del usuario tras el cambio (cierra sus sesiones en
 * todos los dispositivos). Para ser coherentes, también se borra la sesión local: el usuario
 * debe volver a iniciar sesión con la contraseña nueva.
 */
export class ChangePasswordUseCase {
	constructor(
		private readonly accountGateway: AccountGateway,
		private readonly sessionStorage: SessionStorage
	) {}

	async execute(accessToken: string, input: ChangePasswordInput): Promise<void> {
		await this.accountGateway.changePassword(accessToken, input.currentPassword, input.newPassword);
		this.sessionStorage.clear();
	}
}
