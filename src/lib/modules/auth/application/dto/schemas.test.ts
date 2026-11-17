import { describe, expect, it } from 'vitest';
import { ValidationError } from '#lib/shared/errors/app-error.ts';
import { parseFormData } from '#lib/shared/validation/parse-form.ts';
import { changePasswordInputSchema } from './change-password-input';
import { loginCredentialsSchema } from './login-credentials';

function form(fields: Record<string, string>): FormData {
	const data = new FormData();
	for (const [name, value] of Object.entries(fields)) data.set(name, value);
	return data;
}

describe('loginCredentialsSchema', () => {
	it('normaliza el correo y conserva la contraseña tal cual', () => {
		const credentials = parseFormData(
			form({ email: '  Ana@Empresa.TEST ', password: ' con espacios ', injected: 'x' }),
			loginCredentialsSchema
		);

		expect(credentials).toEqual({ email: 'ana@empresa.test', password: ' con espacios ' });
	});

	it('devuelve errores por campo', () => {
		try {
			parseFormData(
				form({ email: 'no-es-correo', password: 'x'.repeat(129) }),
				loginCredentialsSchema
			);
			expect.unreachable();
		} catch (error) {
			expect(error).toBeInstanceOf(ValidationError);
			expect(Object.keys((error as ValidationError).fieldErrors).sort()).toEqual([
				'email',
				'password'
			]);
		}
	});
});

describe('changePasswordInputSchema', () => {
	const valid = {
		currentPassword: 'actual-123',
		newPassword: 'nueva-clave-segura',
		newPasswordConfirmation: 'nueva-clave-segura'
	};

	it('acepta una entrada válida', () => {
		expect(changePasswordInputSchema.safeParse(valid).success).toBe(true);
	});

	it('exige que la confirmación coincida y que la nueva sea distinta', () => {
		const mismatch = changePasswordInputSchema.safeParse({
			...valid,
			newPasswordConfirmation: 'otra'
		});
		const same = changePasswordInputSchema.safeParse({
			...valid,
			currentPassword: valid.newPassword
		});

		expect(mismatch.error?.issues[0].path).toEqual(['newPasswordConfirmation']);
		expect(same.error?.issues[0].path).toEqual(['newPassword']);
	});
});
