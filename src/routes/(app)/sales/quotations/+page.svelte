<script lang="ts">
	import { resolve } from '$app/paths';
	import { Permissions } from '#lib/modules/auth/domain/permissions.ts';
	import Can from '#lib/modules/auth/presentation/Can.svelte';
	import type { SalesOrderStatus } from '#lib/modules/sales/domain/sales-order.ts';
	import SalesOrderTable from '#lib/modules/sales/presentation/SalesOrderTable.svelte';
	import EmptyState from '#lib/shared/ui/EmptyState.svelte';
	import FilterTabs from '#lib/shared/ui/FilterTabs.svelte';
	import Icon from '#lib/shared/ui/Icon.svelte';
	import PageHeader from '#lib/shared/ui/PageHeader.svelte';
	import Pagination from '#lib/shared/ui/Pagination.svelte';
	import { withQuery } from '#lib/shared/ui/url.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const listPath = resolve('/(app)/sales/quotations');
	const newPath = resolve('/(app)/sales/quotations/new');

	const FILTERS: readonly { label: string; status: SalesOrderStatus | null }[] = [
		{ label: 'Todas', status: null },
		{ label: 'Borradores', status: 'DRAFT' },
		{ label: 'Enviadas', status: 'SENT' },
		{ label: 'Confirmadas', status: 'CONFIRMED' },
		{ label: 'Canceladas', status: 'CANCELLED' }
	];

	const currentStatus = $derived(data.query.status ?? null);
	const tabs = $derived(
		FILTERS.map((filter) => ({
			label: filter.label,
			href: withQuery(listPath, { status: filter.status }),
			current: filter.status === currentStatus
		}))
	);
	const hrefFor = (pageNumber: number) =>
		withQuery(listPath, { status: currentStatus, page: pageNumber > 1 ? pageNumber : null });
</script>

<svelte:head>
	<title>Cotizaciones · SkyBu</title>
</svelte:head>

<PageHeader title="Cotizaciones" subtitle="Propuestas a clientes y su recorrido hasta el pedido.">
	{#snippet actions()}
		<Can requirement={Permissions.sales.ordersWrite}>
			<a href={newPath} class="btn-primary">
				<Icon name="plus" size={16} />
				Nueva cotización
			</a>
		</Can>
	{/snippet}
</PageHeader>

<div class="mb-4">
	<FilterTabs {tabs} label="Filtrar por estado" />
</div>

<section class="panel overflow-hidden" aria-label="Listado de cotizaciones">
	{#if data.orders.items.length > 0}
		<SalesOrderTable orders={data.orders.items} today={data.today} />
	{:else if data.orders.totalElements > 0}
		<EmptyState title="Esta página está vacía" description="No hay más documentos que mostrar.">
			{#snippet action()}
				<a href={hrefFor(1)} class="btn-secondary">Ir a la primera página</a>
			{/snippet}
		</EmptyState>
	{:else if currentStatus}
		<EmptyState
			icon="document"
			title="Nada en este estado"
			description="No hay documentos con el estado seleccionado."
		>
			{#snippet action()}
				<a href={listPath} class="btn-secondary">Ver todas</a>
			{/snippet}
		</EmptyState>
	{:else}
		<EmptyState
			icon="document"
			title="Aún no hay cotizaciones"
			description="Crea una cotización para un cliente. Cuando la acepte, confírmala y se convertirá en pedido de venta."
		>
			{#snippet action()}
				<Can requirement={Permissions.sales.ordersWrite}>
					<a href={newPath} class="btn-primary">Nueva cotización</a>
				</Can>
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
	itemsLabel="documentos"
/>
