import { z } from 'zod';
import {
	decimalNumber,
	optionalText,
	optionalUuid,
	requiredText
} from '#lib/shared/validation/common-schemas.ts';
import {
	MAX_LIST_PRICE,
	PRODUCT_DESCRIPTION_MAX_LENGTH,
	PRODUCT_NAME_MAX_LENGTH,
	PRODUCT_TYPES,
	SKU_MAX_LENGTH,
	SKU_PATTERN
} from '../../domain/product';

/**
 * Formulario de alta/edición de producto. Mismos límites que `SaveProductRequest` y
 * `ProductDetails` del backend; el SKU se normaliza igual que el value object `Sku`.
 */
export const saveProductInputSchema = z.object({
	sku: requiredText({
		maxLength: SKU_MAX_LENGTH,
		required: 'Introduce el SKU.',
		tooLong: `El SKU no puede superar ${SKU_MAX_LENGTH} caracteres.`
	})
		.transform((sku) => sku.toUpperCase())
		.pipe(
			z
				.string()
				.regex(
					SKU_PATTERN,
					'Usa letras, dígitos, punto, guion, guion bajo o barra, empezando por letra o dígito.'
				)
		),
	name: requiredText({
		maxLength: PRODUCT_NAME_MAX_LENGTH,
		required: 'Introduce el nombre del producto.',
		tooLong: `El nombre no puede superar ${PRODUCT_NAME_MAX_LENGTH} caracteres.`
	}),
	description: optionalText({
		maxLength: PRODUCT_DESCRIPTION_MAX_LENGTH,
		tooLong: `La descripción no puede superar ${PRODUCT_DESCRIPTION_MAX_LENGTH} caracteres.`
	}),
	type: z.enum(PRODUCT_TYPES, { error: 'Elige el tipo de producto.' }),
	categoryId: optionalUuid('Elige una categoría válida.'),
	listPrice: decimalNumber({
		integerDigits: 12,
		fractionDigits: 2,
		required: 'Introduce el precio de lista.',
		invalid: 'Introduce un precio válido, con dos decimales como máximo.',
		max: { value: MAX_LIST_PRICE, message: 'El precio es demasiado alto.' }
	}),
	taxRatePercent: decimalNumber({
		integerDigits: 3,
		fractionDigits: 2,
		required: 'Introduce la tasa de impuesto (0 si no aplica).',
		invalid: 'Introduce un porcentaje válido, con dos decimales como máximo.',
		max: { value: 100, message: 'La tasa no puede superar el 100 %.' }
	})
});

export type SaveProductInput = z.output<typeof saveProductInputSchema>;
