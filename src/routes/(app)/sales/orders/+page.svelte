<script lang="ts">
	import { resolve } from '$app/paths';
	import SalesOrderTable from '#lib/modules/sales/presentation/SalesOrderTable.svelte';
	import EmptyState from '#lib/shared/ui/EmptyState.svelte';
	import PageHeader from '#lib/shared/ui/PageHeader.svelte';
	import Pagination from '#lib/shared/ui/Pagination.svelte';
	import { withQuery } from '#lib/shared/ui/url.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const listPath = resolve('/(app)/sales/orders');
	const hrefFor = (pageNumber: number) =>
		withQuery(listPath, { page: pageNumber > 1 ? pageNumber : null });
</script>

<svelte:head>
	<title>Pedidos de venta · SkyBu</title>
</svelte:head>

<PageHeader title="Pedidos de venta" subtitle="Cotizaciones confirmadas por los clientes." />

<section class="panel overflow-hidden" aria-label="Listado de pedidos de venta">
	{#if data.orders.items.length > 0}
		<SalesOrderTable orders={data.orders.items} today={data.today} showValidity={false} />
	{:else if data.orders.totalElements > 0}
		<EmptyState title="Esta página está vacía" description="No hay más pedidos que mostrar.">
			{#snippet action()}
				<a href={hrefFor(1)} class="btn-secondary">Ir a la primera página</a>
			{/snippet}
		</EmptyState>
	{:else}
		<EmptyState
			icon="cart"
			title="Aún no hay pedidos"
			description="Los pedidos aparecen aquí al confirmar una cotización."
		>
			{#snippet action()}
				<a href={resolve('/(app)/sales/quotations')} class="btn-secondary">Ver cotizaciones</a>
			{/snippet}
		</EmptyState>
	{/if}
</section>

<Pagination
	pageNumber={data.query.page}
	totalPages={data.orders.totalPages}
	totalElements={data.orders.totalElements}
	pageSize={data.pageSize}
	{hrefFor}
	itemsLabel="pedidos"
/>
