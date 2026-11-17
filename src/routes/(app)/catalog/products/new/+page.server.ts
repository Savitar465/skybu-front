import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { saveProductInputSchema } from '#lib/modules/catalog/application/dto/save-product-input.ts';
import { catalogUseCases } from '#lib/modules/catalog/server/catalog-module.ts';
import { withSession, withSessionAction } from '#lib/modules/auth/server/session-guards.ts';
import { formValues } from '#lib/server/http/action-failure.ts';
import { parseFormData } from '#lib/shared/validation/parse-form.ts';
import type { Actions, PageServerLoad } from './$types';

const PRODUCT_FORM_FIELDS = Object.keys(saveProductInputSchema.shape);

/** `catalog:products:manage` lo exige el hook para toda esta ruta (página y acción). */
export const load: PageServerLoad = (event) =>
	withSession(event, async (session) => ({
		categories: await catalogUseCases.listCategories.execute(session.accessToken)
	}));

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const outcome = await withSessionAction(
			event,
			(session) =>
				catalogUseCases.createProduct.execute(
					session.accessToken,
					parseFormData(formData, saveProductInputSchema)
				),
			formValues(formData, PRODUCT_FORM_FIELDS)
		);
		if (!outcome.ok) {
			return outcome.failure;
		}
		redirect(
			303,
			`${resolve('/(app)/catalog/products/[id=uuid]', { id: outcome.value.id })}?notice=created`
		);
	}
} satisfies Actions;
