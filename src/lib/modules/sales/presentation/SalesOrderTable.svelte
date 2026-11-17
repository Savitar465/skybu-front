<!-- Tabla de documentos de venta (cotizaciones o pedidos). Prioriza número, cliente y total. -->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDateTime, formatIsoDate, formatMoney } from '#lib/shared/formatting/format.ts';
	import { isQuotation, type SalesOrderSummary } from '../domain/sales-order';
	import SalesOrderStatusBadges from './SalesOrderStatusBadges.svelte';

	interface Props {
		orders: readonly SalesOrderSummary[];
		today: string;
		/** En el listado de pedidos la validez de la cotización ya no es relevante. */
		showValidity?: boolean;
	}

	let { orders, today, showValidity = true }: Props = $props();
</script>

<div class="overflow-x-auto">
	<table class="data-table">
		<thead>
			<tr>
				<th scope="col">Número</th>
				<th scope="col">Cliente</th>
				<th scope="col" class="hidden md:table-cell">Fecha</th>
				{#if showValidity}
					<th scope="col" class="hidden lg:table-cell">Válida hasta</th>
				{/if}
				<th scope="col" class="numeric">Total</th>
				<th scope="col" class="hidden sm:table-cell">Estado</th>
			</tr>
		</thead>
		<tbody>
			{#each orders as order (order.id)}
				<tr>
					<td>
						<a
							href={resolve('/(app)/sales/orders/[id=uuid]', { id: order.id })}
							class="font-medium whitespace-nowrap text-label tabular-nums hover:text-accent"
						>
							{order.number}
						</a>
					</td>
					<td class="max-w-64 truncate">{order.customerName}</td>
					<td class="hidden whitespace-nowrap text-label-secondary md:table-cell">
						{formatDateTime(order.createdAt)}
					</td>
					{#if showValidity}
						<td class="hidden whitespace-nowrap text-label-secondary lg:table-cell">
							{isQuotation(order.status) ? formatIsoDate(order.validUntil) : '—'}
						</td>
					{/if}
					<td class="numeric font-medium">{formatMoney(order.total, order.currency)}</td>
					<td class="hidden sm:table-cell"><SalesOrderStatusBadges {order} {today} /></td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
