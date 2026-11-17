import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ValidationError } from '#lib/shared/errors/app-error.ts';
import { parseFormData } from './parse-form';

function formDataOf(entries: [string, string][]): FormData {
	const formData = new FormData();
	for (const [name, value] of entries) {
		formData.append(name, value);
	}
	return formData;
}

describe('parseFormData', () => {
	it('lee solo los campos que declara el esquema', () => {
		const schema = z.object({ name: z.string() });

		const result = parseFormData(
			formDataOf([
				['name', 'Ana'],
				['role', 'admin']
			]),
			schema
		);

		expect(result).toEqual({ name: 'Ana' });
	});

	it('reagrupa los campos repetidos `<campo>.<subcampo>` en filas por posición', () => {
		const schema = z.object({
			customerId: z.string(),
			lines: z.array(z.object({ productId: z.string(), quantity: z.coerce.number() }))
		});

		const result = parseFormData(
			formDataOf([
				['customerId', 'c-1'],
				['lines.productId', 'p-1'],
				['lines.quantity', '2'],
				['lines.productId', 'p-2'],
				['lines.quantity', '5']
			]),
			schema
		);

		expect(result.lines).toEqual([
			{ productId: 'p-1', quantity: 2 },
			{ productId: 'p-2', quantity: 5 }
		]);
	});

	it('devuelve una lista vacía si no se envía ninguna fila', () => {
		const schema = z.object({ lines: z.array(z.object({ productId: z.string() })) });

		expect(parseFormData(new FormData(), schema)).toEqual({ lines: [] });
	});

	it('señala los errores de una fila con su posición', () => {
		const schema = z.object({
			lines: z.array(z.object({ productId: z.string().min(1, 'Elige un producto.') }))
		});

		const parse = () =>
			parseFormData(
				formDataOf([
					['lines.productId', 'p-1'],
					['lines.productId', '']
				]),
				schema
			);

		expect(parse).toThrow(ValidationError);
		expect(parse).toThrow(
			expect.objectContaining({ fieldErrors: { 'lines.1.productId': ['Elige un producto.'] } })
		);
	});

	it('marca como ausente el subcampo que falta en una fila incompleta', () => {
		const schema = z.object({
			lines: z.array(z.object({ productId: z.string(), quantity: z.string().optional() }))
		});

		const result = parseFormData(
			formDataOf([
				['lines.productId', 'p-1'],
				['lines.productId', 'p-2'],
				['lines.quantity', '3']
			]),
			schema
		);

		expect(result.lines).toEqual([
			{ productId: 'p-1', quantity: '3' },
			{ productId: 'p-2', quantity: undefined }
		]);
	});
});
