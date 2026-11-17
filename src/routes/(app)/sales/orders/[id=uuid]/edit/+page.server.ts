import { redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { withSession, withSessionAction } from '#lib/modules/auth/server/session-guards.ts';
import { saveSalesOrderInputSchema } from '#lib/modules/sales/application/dto/save-sales-order-input.ts';
import { isEditable } from '#lib/modules/sales/domain/sales-order.ts';
import { salesUseCases } from '#lib/modules/sales/server/sales-module.ts';
import { parseFormData } from '#lib/shared/validation/parse-form.ts';
import type { Actions, PageServerLoad } from './$types';

/**
 * Edición de un borrador. `sales:orders:write` lo exige el hook. Un documento que ya no es
 * editable (enviado, confirmado...) devuelve a su detalle, donde se explica qué se puede hacer.
 */
export const load: PageServerLoad = (event) =>
	withSession(event, async (session) => {
		const detail = await salesUseCases.getSalesOrder.execute(session.accessToken, event.params.id);
		if (!isEditable(detail.order.status)) {
			redirect(303, resolve('/(app)/sales/orders/[id=uuid]', { id: event.params.id }));
		}
		return detail;
	});

export const actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const outcome = await withSessionAction(event, (session) =>
			salesUseCases.saveQuotation.update(
				session.accessToken,
				event.params.id,
				parseFormData(formData, saveSalesOrderInputSchema)
			)
		);
		if (!outcome.ok) {
			return outcome.failure;
		}
		redirect(
			303,
			`${resolve('/(app)/sales/orders/[id=uuid]', { id: event.params.id })}?notice=saved`
		);
	}
} satisfies Actions;
