import { describe, expect, it } from 'vitest';
import { ValidationError } from '#lib/shared/errors/app-error.ts';
import { problemToAppError } from './problem-details';

describe('problemToAppError', () => {
	it('unifica las rutas de los errores de listas con las de la validación del frontend', () => {
		const error = problemToAppError(400, {
			code: 'validation_failed',
			detail: 'Datos inválidos',
			errors: [
				{ field: 'lines[1].quantity', message: 'debe ser mayor que 0' },
				{ field: 'customerId', message: 'no puede ser nulo' }
			]
		});

		expect(error).toBeInstanceOf(ValidationError);
		expect(error).toMatchObject({
			fieldErrors: {
				'lines.1.quantity': ['debe ser mayor que 0'],
				customerId: ['no puede ser nulo']
			}
		});
	});
});
