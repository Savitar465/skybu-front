import { z } from 'zod';
import type { HttpClient } from '#lib/server/http/http-client.ts';
import type { UserProfile } from '../application/dto/user-profile';
import type { AccountGateway } from '../application/ports';

/** Contrato de `UserView` del backend (solo los campos que usa el frontend). */
const userViewSchema = z
	.object({
		id: z.uuid(),
		email: z.string().max(254),
		fullName: z.string().max(200),
		roles: z.array(z.object({ id: z.uuid(), name: z.string().max(100) })).max(100),
		lastLoginAt: z.iso
			.datetime({ offset: true })
			.nullable()
			.transform((value) => (value ? new Date(value) : null))
	})
	.transform((user): UserProfile => user);

/** Adaptador de `AccountGateway` sobre `/api/v1/account`. */
export class HttpAccountGateway implements AccountGateway {
	constructor(private readonly httpClient: HttpClient) {}

	getProfile(accessToken: string): Promise<UserProfile> {
		return this.httpClient.send({
			method: 'GET',
			path: '/api/v1/account',
			accessToken,
			responseSchema: userViewSchema
		});
	}

	changePassword(accessToken: string, currentPassword: string, newPassword: string): Promise<void> {
		return this.httpClient.send({
			method: 'PUT',
			path: '/api/v1/account/password',
			accessToken,
			body: { currentPassword, newPassword },
			responseSchema: null
		});
	}
}
