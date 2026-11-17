<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Permissions } from '#lib/modules/auth/domain/permissions.ts';
	import { can } from '#lib/modules/auth/presentation/authorization.ts';
	import { TRANSITION_PERMISSIONS } from '#lib/modules/sales/application/transition-permissions.ts';
	import {
		blockerFor,
		isEditable,
		isQuotation,
		transitionsFor,
		type SalesOrderTransition
	} from '#lib/modules/sales/domain/sales-order.ts';
	import SalesOrderStatusBadges from '#lib/modules/sales/presentation/SalesOrderStatusBadges.svelte';
	import {
		blockerMessage,
		documentKind,
		SALES_NOTICES,
		TRANSITION_DONE,
		TRANSITION_LABELS
	} from '#lib/modules/sales/presentation/sales-labels.ts';
	import StatusTrail from '#lib/modules/sales/presentation/StatusTrail.svelte';
	import {
		formatDateTime,
		formatIsoDate,
		formatMoney,
		formatPercent,
		formatQuantity
	} from '#lib/shared/formatting/format.ts';
	import ConfirmDialog from '#lib/shared/ui/ConfirmDialog.svelte';
	import { formFailureOf } from '#lib/shared/ui/form-failure.ts';
	import Icon from '#lib/shared/ui/Icon.svelte';
	import Notice from '#lib/shared/ui/Notice.svelte';
	import PageHeader from '#lib/shared/ui/PageHeader.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const order = $derived(data.order);
	const failure = $derived(formFailureOf(form));
	const successMessage = $derived(
		form?.completed
			? TRANSITION_DONE[form.completed]
			: data.notice && !form
				? SALES_NOTICES[data.notice]
				: null
	);

	/** Transiciones que el estado admite y el usuario puede ejecutar, con su posible bloqueo. */
	const transitions = $derived(
		transitionsFor(order.status)
			.filter((transition) => can(TRANSITION_PERMISSIONS[transition]))
			.map((transition) => ({ transition, blocker: blockerFor(order, transition, data.today) }))
	);
	const available = (transition: SalesOrderTransition) =>
		transitions.find((candidate) => candidate.transition === transition);
	const blockers = $derived([
		...new Set(transitions.flatMap(({ blocker }) => (blocker ? [blocker] : [])))
	]);
	const canEdit = $derived(isEditable(order.status) && can(Permissions.sales.ordersWrite));
	const back = $derived(
		isQuotation(order.status)
			? { href: resolve('/(app)/sales/quotations'), label: 'Cotizaciones' }
			: { href: resolve('/(app)/sales/orders'), label: 'Pedidos de venta' }
	);
	const money = (amount: number) => formatMoney(amount, order.currency);

	let pendingTransition: SalesOrderTransition | null = $state(null);
	const send = $derived(available('send'));
	const reopen = $derived(available('reopen'));
	const confirm = $derived(available('confirm'));
	const cancel = $derived(available('cancel'));
</script>

<svelte:head>
	<title>{order.number} · {documentKind(order.status)} · SkyBu</title>
</svelte:head>

{#snippet transitionButton(transition: SalesOrderTransition, disabled: boolean)}
	<form
		method="POST"
		action="?/{transition}"
		use:enhance={() => {
			pendingTransition = transition;
			return async ({ update }) => {
				await update();
				pendingTransition = null;
			};
		}}
	>
		<button
			type="submit"
			class="btn-secondary"
			disabled={disabled || pendingTransition !== null}
			aria-describedby={disabled ? 'transition-blockers' : undefined}
		>
			{pendingTransition === transition ? 'Procesando…' : TRANSITION_LABELS[transition]}
		</button>
	</form>
{/snippet}

<PageHeader
	title={order.number}
	subtitle="{documentKind(order.status)} · {order.customerName}"
	{back}
>
	{#snippet titleAccessory()}
		<SalesOrderStatusBadges {order} today={data.today} />
	{/snippet}
	{#snippet actions()}
		{#if canEdit}
			<a
				href={resolve('/(app)/sales/orders/[id=uuid]/edit', { id: order.id })}
				class="btn-secondary"
			>
				<Icon name="pencil" size={16} />
				Editar
			</a>
		{/if}
		{#if send}
			{@render transitionButton('send', send.blocker !== null)}
		{/if}
		{#if reopen}
			{@render transitionButton('reopen', false)}
		{/if}
		{#if cancel}
			<ConfirmDialog
				triggerLabel={TRANSITION_LABELS.cancel}
				triggerClass="btn-danger"
				title="¿Cancelar {order.number}?"
				message={order.status === 'CONFIRMED'
					? 'El pedido confirmado quedará cancelado de forma definitiva.'
					: 'La cotización quedará cancelada de forma definitiva. No se podrá reabrir.'}
				confirmLabel="Cancelar documento"
				action="?/cancel"
				tone="danger"
			/>
		{/if}
		{#if confirm}
			{#if confirm.blocker}
				<button type="button" class="btn-primary" disabled aria-describedby="transition-blockers">
					{TRANSITION_LABELS.confirm}
				</button>
			{:else}
				<ConfirmDialog
					triggerLabel={TRANSITION_LABELS.confirm}
					triggerClass="btn-primary"
					title="¿Confirmar {order.number}?"
					message="La cotización se convertirá en pedido de venta por {money(
						order.total
					)}. Ya no podrá editarse."
					confirmLabel="Confirmar pedido"
					action="?/confirm"
				/>
			{/if}
		{/if}
	{/snippet}
</PageHeader>

<div class="space-y-6">
	<StatusTrail status={order.status} />

	{#if successMessage}
		<Notice tone="success" message={successMessage} />
	{/if}
	{#if failure}
		<Notice tone="error" message={failure.message} />
	{/if}
	{#if blockers.length > 0}
		<div id="transition-blockers" class="space-y-2">
			{#each blockers as blocker (blocker)}
				<Notice tone="info" message={blockerMessage(blocker, order.validUntil)} />
			{/each}
		</div>
	{/if}

	<section class="panel p-5 sm:p-6" aria-label="Datos del documento">
		<dl class="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
			<div>
				<dt class="text-label-secondary">Cliente</dt>
				<dd class="mt-0.5 font-medium">{order.customerName}</dd>
			</div>
			<div>
				<dt class="text-label-secondary">Creada</dt>
				<dd class="mt-0.5">{formatDateTime(order.createdAt)}</dd>
			</div>
			{#if isQuotation(order.status)}
				<div>
					<dt class="text-label-secondary">Válida hasta</dt>
					<dd class="mt-0.5">{formatIsoDate(order.validUntil)}</dd>
				</div>
			{/if}
			{#if order.sentAt}
				<div>
					<dt class="text-label-secondary">Enviada</dt>
					<dd class="mt-0.5">{formatDateTime(order.sentAt)}</dd>
				</div>
			{/if}
			{#if order.confirmedAt}
				<div>
					<dt class="text-label-secondary">Confirmada</dt>
					<dd class="mt-0.5">{formatDateTime(order.confirmedAt)}</dd>
				</div>
			{/if}
			{#if order.cancelledAt}
				<div>
					<dt class="text-label-secondary">Cancelada</dt>
					<dd class="mt-0.5">{formatDateTime(order.cancelledAt)}</dd>
				</div>
			{/if}
			<div>
				<dt class="text-label-secondary">Moneda</dt>
				<dd class="mt-0.5">{order.currency}</dd>
			</div>
		</dl>
	</section>

	<section class="panel overflow-hidden" aria-labelledby="lines-title">
		<h2 id="lines-title" class="text-headline px-5 pt-4 pb-3 sm:px-6">Líneas</h2>
		{#if order.lines.length === 0}
			<p class="border-t border-separator px-6 py-8 text-center text-sm text-label-secondary">
				Este documento todavía no tiene líneas.
			</p>
		{:else}
			<div class="overflow-x-auto border-t border-separator">
				<table class="data-table">
					<thead>
						<tr>
							<th scope="col">Producto</th>
							<th scope="col" class="numeric">Cantidad</th>
							<th scope="col" class="numeric hidden md:table-cell">Precio unit.</th>
							<th scope="col" class="numeric hidden md:table-cell">Desc.</th>
							<th scope="col" class="numeric hidden lg:table-cell">Impuesto</th>
							<th scope="col" class="numeric">Subtotal</th>
						</tr>
					</thead>
					<tbody>
						{#each order.lines as line (line.id)}
							<tr>
								<td class="max-w-80">
									<span class="block truncate font-medium">{line.productName}</span>
									<span class="block font-mono text-xs text-label-secondary">{line.productSku}</span
									>
								</td>
								<td class="numeric">{formatQuantity(line.quantity)}</td>
								<td class="numeric hidden md:table-cell">{money(line.unitPrice)}</td>
								<td class="numeric hidden text-label-secondary md:table-cell">
									{line.discountPercent > 0 ? formatPercent(line.discountPercent) : '—'}
								</td>
								<td class="numeric hidden text-label-secondary lg:table-cell">
									{formatPercent(line.taxRatePercent)}
								</td>
								<td class="numeric font-medium">{money(line.subtotal)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<div class="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem]">
		<section aria-labelledby="notes-title">
			<h2 id="notes-title" class="text-sm font-medium text-label-secondary">Notas</h2>
			<p class="mt-1 text-sm whitespace-pre-line">{order.notes ?? 'Sin notas.'}</p>
		</section>
		<section class="panel self-start p-5" aria-label="Totales">
			<dl class="space-y-2 text-sm">
				<div class="flex justify-between gap-4">
					<dt class="text-label-secondary">Subtotal</dt>
					<dd class="tabular-nums">{money(order.subtotal)}</dd>
				</div>
				<div class="flex justify-between gap-4">
					<dt class="text-label-secondary">Impuestos</dt>
					<dd class="tabular-nums">{money(order.taxTotal)}</dd>
				</div>
				<div
					class="flex justify-between gap-4 border-t border-separator pt-2 text-base font-semibold"
				>
					<dt>Total</dt>
					<dd class="tabular-nums">{money(order.total)}</dd>
				</div>
			</dl>
		</section>
	</div>
</div>
