import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { withSessionAction } from '#lib/modules/auth/server/session-guards.ts';
import { saveSalesOrderInputSchema } from '#lib/modules/sales/application/dto/save-sales-order-input.ts';
import { salesUseCases } from '#lib/modules/sales/server/sales-module.ts';
import { parseFormData } from '#lib/shared/validation/parse-form.ts';
import type { Actions, PageServerLoad } from './$types';

/** `sales:orders:write` lo exige el hook para toda esta ruta (página y acción). */
export const load: PageServerLoad = () => ({ today: salesUseCases.saveQuotation.today() });

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		// Sin `values`: el editor conserva su propio estado tras un error (las líneas no caben en
		// un mapa plano de valores).
		const outcome = await withSessionAction(event, (session) =>
			salesUseCases.saveQuotation.create(
				session.accessToken,
				parseFormData(formData, saveSalesOrderInputSchema)
			)
		);
		if (!outcome.ok) {
			return outcome.failure;
		}
		redirect(
			303,
			`${resolve('/(app)/sales/orders/[id=uuid]', { id: outcome.value.id })}?notice=created`
		);
	}
} satisfies Actions;
