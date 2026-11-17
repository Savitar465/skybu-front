import { Permissions } from '#lib/modules/auth/domain/permissions.ts';
import {
	requirePermission,
	withSession,
	withSessionAction
} from '#lib/modules/auth/server/session-guards.ts';
import {
	createCategoryInputSchema,
	deleteCategoryInputSchema,
	renameCategoryInputSchema
} from '#lib/modules/catalog/application/dto/category-input.ts';
import { catalogUseCases } from '#lib/modules/catalog/server/catalog-module.ts';
import { formValues } from '#lib/server/http/action-failure.ts';
import { parseFormData } from '#lib/shared/validation/parse-form.ts';
import type { Actions, PageServerLoad } from './$types';

/** Ver las categorías exige `catalog:products:read` (hook); modificarlas, `catalog:categories:manage`. */
export const load: PageServerLoad = (event) =>
	withSession(event, async (session) => ({
		categories: await catalogUseCases.listCategories.execute(session.accessToken)
	}));

export const actions = {
	create: async (event) => {
		requirePermission(event, Permissions.catalog.categoriesManage);
		const formData = await event.request.formData();
		const outcome = await withSessionAction(
			event,
			(session) =>
				catalogUseCases.createCategory.execute(
					session.accessToken,
					parseFormData(formData, createCategoryInputSchema)
				),
			{ ...formValues(formData, ['name']), intent: 'create' }
		);
		return outcome.ok
			? { completed: 'created' as const, name: outcome.value.name }
			: outcome.failure;
	},

	rename: async (event) => {
		requirePermission(event, Permissions.catalog.categoriesManage);
		const formData = await event.request.formData();
		const outcome = await withSessionAction(
			event,
			(session) =>
				catalogUseCases.renameCategory.execute(
					session.accessToken,
					parseFormData(formData, renameCategoryInputSchema)
				),
			{ ...formValues(formData, ['categoryId', 'name']), intent: 'rename' }
		);
		return outcome.ok
			? { completed: 'renamed' as const, name: outcome.value.name }
			: outcome.failure;
	},

	delete: async (event) => {
		requirePermission(event, Permissions.catalog.categoriesManage);
		const formData = await event.request.formData();
		const outcome = await withSessionAction(
			event,
			(session) =>
				catalogUseCases.deleteCategory.execute(
					session.accessToken,
					parseFormData(formData, deleteCategoryInputSchema).categoryId
				),
			{ ...formValues(formData, ['categoryId']), intent: 'delete' }
		);
		return outcome.ok ? { completed: 'deleted' as const, name: '' } : outcome.failure;
	}
} satisfies Actions;
