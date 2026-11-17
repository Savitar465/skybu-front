import { describe, expect, it } from 'vitest';
import { CUSTOMER_ID, PRODUCT_ID } from '../../testing/fakes';
import { salesOrderListQuerySchema } from './list-queries';
import { saveSalesOrderInputSchema } from './save-sales-order-input';

const validInput = {
	customerId: CUSTOMER_ID,
	validUntil: '',
	notes: '  Entrega en 48 h  ',
	lines: [{ productId: PRODUCT_ID, quantity: '1,5', discountPercent: '' }]
};

describe('saveSalesOrderInputSchema', () => {
	it('normaliza el formulario al contrato de la API', () => {
		expect(saveSalesOrderInputSchema.parse(validInput)).toEqual({
			customerId: CUSTOMER_ID,
			validUntil: null,
			notes: 'Entrega en 48 h',
			lines: [{ productId: PRODUCT_ID, quantity: 1.5, discountPercent: null }]
		});
	});

	it('admite un borrador sin líneas', () => {
		expect(saveSalesOrderInputSchema.parse({ ...validInput, lines: [] }).lines).toEqual([]);
	});

	it('señala cada error de línea con su posición', () => {
		const result = saveSalesOrderInputSchema.safeParse({
			...validInput,
			lines: [
				{ productId: PRODUCT_ID, quantity: '1', discountPercent: '' },
				{ productId: '', quantity: '0', discountPercent: '150' }
			]
		});

		expect(result.success).toBe(false);
		const paths = result.error?.issues.map((issue) => issue.path.join('.'));
		expect(paths).toEqual(['lines.1.productId', 'lines.1.quantity', 'lines.1.discountPercent']);
	});

	it('exige un cliente', () => {
		const result = saveSalesOrderInputSchema.safeParse({ ...validInput, customerId: '' });

		expect(result.error?.issues[0]).toMatchObject({
			path: ['customerId'],
			message: 'Elige un cliente.'
		});
	});
});

describe('salesOrderListQuerySchema', () => {
	it('ignora un estado desconocido en la URL', () => {
		expect(salesOrderListQuerySchema.parse({ status: 'HACKED', page: '2' })).toEqual({
			status: undefined,
			page: 2
		});
	});
});
