import type { RoleSummary } from '../dto/role-summary';
import type { RoleDirectory } from '../ports';

/** Lista los roles de la empresa, ordenados por nombre para una presentación estable. */
export class ListRolesUseCase {
	constructor(private readonly roleDirectory: RoleDirectory) {}

	async execute(accessToken: string): Promise<readonly RoleSummary[]> {
		const roles = await this.roleDirectory.list(accessToken);
		return [...roles].sort((a, b) => a.name.localeCompare(b.name, 'es'));
	}
}
