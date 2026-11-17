import type { UserProfile } from '../dto/user-profile';
import type { AccountGateway } from '../ports';

/** Obtiene el perfil (nombre, roles) del usuario autenticado para mostrarlo en la interfaz. */
export class GetCurrentProfileUseCase {
	constructor(private readonly accountGateway: AccountGateway) {}

	execute(accessToken: string): Promise<UserProfile> {
		return this.accountGateway.getProfile(accessToken);
	}
}
