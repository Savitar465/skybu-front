import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import {
	requirePermission,
	withSession,
	withSessionAction
} from '#lib/modules/auth/server/session-guards.ts';
import { TRANSITION_PERMISSIONS } from '#lib/modules/sales/application/transition-permissions.ts';
import type { SalesOrderTransition } from '#lib/modules/sales/domain/sales-order.ts';
import { salesUseCases } from '#lib/modules/sales/server/sales-module.ts';
import { parseSearchParams } from '#lib/shared/validation/parse-query.ts';
import type { Actions, PageServerLoad } from './$types';

/** Aviso tras redirigir desde el alta o la edición. Solo códigos conocidos. */
const noticeQuerySchema = z.object({
	notice: z.enum(['created', 'saved']).optional().catch(undefined)
});

/** Ver el documento exige `sales:orders:read` (hook); cada transición, su propio permiso. */
export const load: PageServerLoad = (event) =>
	withSession(event, async (session) => ({
		...(await salesUseCases.getSalesOrder.execute(session.accessToken, event.params.id)),
		notice: parseSearchParams(event.url.searchParams, noticeQuerySchema).notice ?? null
	}));

export const actions = {
	send: (event) => runTransition(event, 'send'),
	reopen: (event) => runTransition(event, 'reopen'),
	confirm: (event) => runTransition(event, 'confirm'),
	cancel: (event) => runTransition(event, 'cancel')
} satisfies Actions;

async function runTransition(
	event: RequestEvent<{ id: string }>,
	transition: SalesOrderTransition
) {
	requirePermission(event, TRANSITION_PERMISSIONS[transition]);
	const outcome = await withSessionAction(event, (session) =>
		salesUseCases.changeStatus.execute(session.accessToken, event.params.id, transition)
	);
	return outcome.ok ? { completed: transition } : outcome.failure;
}
