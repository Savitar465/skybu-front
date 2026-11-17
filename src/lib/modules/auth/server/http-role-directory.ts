import { z } from 'zod';
import type { HttpClient } from '#lib/server/http/http-client.ts';
import type { RoleSummary } from '../application/dto/role-summary';
import type { RoleDirectory } from '../application/ports';
import { PERMISSION_CODE_PATTERN } from '../domain/permissions';

const roleViewSchema = z.object({
	id: z.uuid(),
	name: z.string().max(100),
	description: z.string().max(500).nullable(),
	systemRole: z.boolean(),
	permissions: z.array(z.string().max(100).regex(PERMISSION_CODE_PATTERN)).max(500)
});

const roleListSchema = z
	.array(roleViewSchema)
	.max(1000)
	.transform((roles): readonly RoleSummary[] => roles);

/** Adaptador de `RoleDirectory` sobre `GET /api/v1/roles` (exige `iam:roles:read` en la API). */
export class HttpRoleDirectory implements RoleDirectory {
	constructor(private readonly httpClient: HttpClient) {}

	list(accessToken: string): Promise<readonly RoleSummary[]> {
		return this.httpClient.send({
			method: 'GET',
			path: '/api/v1/roles',
			accessToken,
			responseSchema: roleListSchema
		});
	}
}
