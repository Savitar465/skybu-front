import { z } from 'zod';
import { requiredText } from '#lib/shared/validation/common-schemas.ts';
import { CATEGORY_NAME_MAX_LENGTH } from '../../domain/product';

const categoryName = requiredText({
	maxLength: CATEGORY_NAME_MAX_LENGTH,
	required: 'Introduce el nombre de la categoría.',
	tooLong: `El nombre no puede superar ${CATEGORY_NAME_MAX_LENGTH} caracteres.`
});

const categoryId = z.uuid({ error: 'La categoría no es válida.' });

export const createCategoryInputSchema = z.object({ name: categoryName });

export const renameCategoryInputSchema = z.object({ categoryId, name: categoryName });

export const deleteCategoryInputSchema = z.object({ categoryId });

export type CreateCategoryInput = z.output<typeof createCategoryInputSchema>;
export type RenameCategoryInput = z.output<typeof renameCategoryInputSchema>;
