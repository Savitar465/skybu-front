import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { Permissions } from '#lib/modules/auth/domain/permissions.ts';
import {
	requirePermission,
	withSession,
	withSessionAction
} from '#lib/modules/auth/server/session-guards.ts';
import { saveProductInputSchema } from '#lib/modules/catalog/application/dto/save-product-input.ts';
import { catalogUseCases } from '#lib/modules/catalog/server/catalog-module.ts';
import { formValues } from '#lib/server/http/action-failure.ts';
import { parseFormData } from '#lib/shared/validation/parse-form.ts';
import { parseSearchParams } from '#lib/shared/validation/parse-query.ts';
import type { Actions, PageServerLoad } from './$types';

const PRODUCT_FORM_FIELDS = Object.keys(saveProductInputSchema.shape);

/** Aviso tras redirigir desde el alta. Solo códigos conocidos. */
const noticeQuerySchema = z.object({ notice: z.enum(['created']).optional().catch(undefined) });

/** Ver la ficha exige `catalog:products:read` (hook); modificarla, `catalog:products:manage`. */
export const load: PageServerLoad = (event) =>
	withSession(event, async (session) => ({
		...(await catalogUseCases.getProduct.execute(session.accessToken, event.params.id)),
		notice: parseSearchParams(event.url.searchParams, noticeQuerySchema).notice ?? null
	}));

export const actions = {
	save: async (event) => {
		requirePermission(event, Permissions.catalog.productsManage);
		const formData = await event.request.formData();
		const outcome = await withSessionAction(
			event,
			(session) =>
				catalogUseCases.updateProduct.execute(
					session.accessToken,
					event.params.id,
					parseFormData(formData, saveProductInputSchema)
				),
			formValues(formData, PRODUCT_FORM_FIELDS)
		);
		return outcome.ok ? { completed: 'saved' as const } : outcome.failure;
	},
	activate: (event) => setActive(event, true),
	deactivate: (event) => setActive(event, false)
} satisfies Actions;

async function setActive(event: RequestEvent<{ id: string }>, active: boolean) {
	requirePermission(event, Permissions.catalog.productsManage);
	const outcome = await withSessionAction(event, (session) =>
		catalogUseCases.setProductActive.execute(session.accessToken, event.params.id, active)
	);
	if (!outcome.ok) {
		return outcome.failure;
	}
	return { completed: active ? ('activated' as const) : ('deactivated' as const) };
}
