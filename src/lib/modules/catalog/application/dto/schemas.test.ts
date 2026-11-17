import { describe, expect, it } from 'vitest';
import { renameCategoryInputSchema } from './category-input';
import { productListQuerySchema } from './product-list-query';
import { saveProductInputSchema } from './save-product-input';

const validForm = {
	sku: ' caf-250 ',
	name: ' Café molido 250 g ',
	description: '',
	type: 'GOODS',
	categoryId: '',
	listPrice: '35,5',
	taxRatePercent: '13'
};

describe('saveProductInputSchema', () => {
	it('normaliza el formulario como lo hace el backend', () => {
		expect(saveProductInputSchema.parse(validForm)).toEqual({
			sku: 'CAF-250',
			name: 'Café molido 250 g',
			description: null,
			type: 'GOODS',
			categoryId: null,
			listPrice: 35.5,
			taxRatePercent: 13
		});
	});

	it.each([
		[
			'sku',
			'-CAF',
			'Usa letras, dígitos, punto, guion, guion bajo o barra, empezando por letra o dígito.'
		],
		[
			'sku',
			'CAF 250',
			'Usa letras, dígitos, punto, guion, guion bajo o barra, empezando por letra o dígito.'
		],
		['type', 'WEAPON', 'Elige el tipo de producto.'],
		['listPrice', '10.999', 'Introduce un precio válido, con dos decimales como máximo.'],
		['taxRatePercent', '101', 'La tasa no puede superar el 100 %.'],
		['categoryId', 'no-es-un-uuid', 'Elige una categoría válida.']
	])('rechaza %s = %j', (field, value, message) => {
		const result = saveProductInputSchema.safeParse({ ...validForm, [field]: value });

		expect(result.error?.issues).toEqual([expect.objectContaining({ path: [field], message })]);
	});
});

describe('renameCategoryInputSchema', () => {
	it('exige un id de categoría válido y un nombre', () => {
		const result = renameCategoryInputSchema.safeParse({ categoryId: 'x', name: '  ' });

		expect(result.error?.issues.map((issue) => issue.path[0])).toEqual(['categoryId', 'name']);
	});
});

describe('productListQuerySchema', () => {
	it('lee los filtros de la URL con valores por defecto seguros', () => {
		expect(productListQuerySchema.parse({ search: ' café ', inactive: '1', page: '2' })).toEqual({
			search: 'café',
			inactive: true,
			page: 2
		});
		expect(productListQuerySchema.parse({})).toEqual({ search: '', inactive: false, page: 1 });
	});
});
