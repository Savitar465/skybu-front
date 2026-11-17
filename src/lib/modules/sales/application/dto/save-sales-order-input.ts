import { z } from 'zod';
import {
	decimalNumber,
	optionalDecimalNumber,
	optionalIsoDate,
	optionalText
} from '#lib/shared/validation/common-schemas.ts';
import { MAX_LINE_QUANTITY, MAX_NOTES_LENGTH, MAX_ORDER_LINES } from '../../domain/sales-order';

/**
 * Línea de la cotización. Solo producto, cantidad y descuento: precio e impuesto los fija el
 * servidor a partir del catálogo (el cliente nunca puede decidir lo que cobra).
 */
const lineInputSchema = z.object({
	productId: z.uuid({ error: 'Elige un producto.' }),
	quantity: decimalNumber({
		integerDigits: 9,
		fractionDigits: 3,
		required: 'Indica la cantidad.',
		invalid: 'Introduce una cantidad válida, con tres decimales como máximo.',
		min: { value: 0, inclusive: false, message: 'La cantidad debe ser mayor que 0.' },
		max: { value: MAX_LINE_QUANTITY, message: 'La cantidad es demasiado alta.' }
	}),
	discountPercent: optionalDecimalNumber({
		integerDigits: 3,
		fractionDigits: 2,
		invalid: 'Introduce un descuento válido, con dos decimales como máximo.',
		max: { value: 100, message: 'El descuento no puede superar el 100 %.' }
	})
});

/**
 * Formulario de cotización (alta y edición de un borrador). Mismos límites que
 * `SaveSalesOrderRequest`. Un borrador puede guardarse sin líneas; enviarlo o confirmarlo no.
 */
export const saveSalesOrderInputSchema = z.object({
	customerId: z.uuid({ error: 'Elige un cliente.' }),
	validUntil: optionalIsoDate('Introduce una fecha válida.'),
	notes: optionalText({
		maxLength: MAX_NOTES_LENGTH,
		tooLong: `Las notas no pueden superar ${MAX_NOTES_LENGTH} caracteres.`
	}),
	lines: z
		.array(lineInputSchema)
		.max(MAX_ORDER_LINES, `Una cotización admite como máximo ${MAX_ORDER_LINES} líneas.`)
});

export type SaveSalesOrderInput = z.output<typeof saveSalesOrderInputSchema>;
export type SaveSalesOrderLineInput = SaveSalesOrderInput['lines'][number];
