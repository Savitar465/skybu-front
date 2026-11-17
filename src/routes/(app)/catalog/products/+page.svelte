<script lang="ts">
	import { resolve } from '$app/paths';
	import { Permissions } from '#lib/modules/auth/domain/permissions.ts';
	import Can from '#lib/modules/auth/presentation/Can.svelte';
	import {
		PRODUCT_STATUS_BADGES,
		PRODUCT_TYPE_LABELS
	} from '#lib/modules/catalog/presentation/catalog-labels.ts';
	import { formatAmount, formatPercent } from '#lib/shared/formatting/format.ts';
	import Badge from '#lib/shared/ui/Badge.svelte';
	import EmptyState from '#lib/shared/ui/EmptyState.svelte';
	import Icon from '#lib/shared/ui/Icon.svelte';
	import PageHeader from '#lib/shared/ui/PageHeader.svelte';
	import Pagination from '#lib/shared/ui/Pagination.svelte';
	import { withQuery } from '#lib/shared/ui/url.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const listPath = resolve('/(app)/catalog/products');
	const filtered = $derived(data.query.search !== '' || data.query.inactive);

	const hrefFor = (pageNumber: number) =>
		withQuery(listPath, {
			search: data.query.search,
			inactive: data.query.inactive ? 1 : null,
			page: pageNumber > 1 ? pageNumber : null
		});
</script>

<svelte:head>
	<title>Productos · SkyBu</title>
</svelte:head>

<PageHeader title="Productos" subtitle="Bienes y servicios que vende tu empresa.">
	{#snippet actions()}
		<Can requirement={Permissions.catalog.productsManage}>
			<a href={resolve('/(app)/catalog/products/new')} class="btn-primary">
				<Icon name="plus" size={16} />
				Nuevo producto
			</a>
		</Can>
	{/snippet}
</PageHeader>

<!-- Filtros en la URL: GET nativo, así la búsqueda se puede compartir y volver atrás. -->
<form
	method="GET"
	data-sveltekit-keepfocus
	data-sveltekit-noscroll
	class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center"
	role="search"
>
	<div class="relative sm:w-80">
		<label for="search" class="sr-only">Buscar por nombre o SKU</label>
		<span
			class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-label-tertiary"
		>
			<Icon name="search" size={16} />
		</span>
		<input
			id="search"
			name="search"
			type="search"
			maxlength="100"
			placeholder="Buscar por nombre o SKU"
			value={data.query.search}
			class="field-input pl-9"
		/>
	</div>
	<label class="flex items-center gap-2 text-sm text-label">
		<input
			type="checkbox"
			name="inactive"
			value="1"
			checked={data.query.inactive}
			class="field-checkbox"
			onchange={(event) => event.currentTarget.form?.requestSubmit()}
		/>
		Incluir inactivos
	</label>
	<button type="submit" class="btn-secondary sm:ml-auto">Buscar</button>
</form>

<section class="panel overflow-hidden" aria-label="Listado de productos">
	{#if data.products.items.length === 0}
		{#if data.products.totalElements > 0}
			<EmptyState title="Esta página está vacía" description="No hay más productos que mostrar.">
				{#snippet action()}
					<a href={hrefFor(1)} class="btn-secondary">Ir a la primera página</a>
				{/snippet}
			</EmptyState>
		{:else if filtered}
			<EmptyState
				icon="search"
				title="Sin resultados"
				description="Ningún producto coincide con la búsqueda. Prueba con otro nombre o SKU."
			>
				{#snippet action()}
					<a href={listPath} class="btn-secondary">Quitar filtros</a>
				{/snippet}
			</EmptyState>
		{:else}
			<EmptyState
				icon="box"
				title="Aún no hay productos"
				description="Crea tu primer producto para poder incluirlo en cotizaciones."
			>
				{#snippet action()}
					<Can requirement={Permissions.catalog.productsManage}>
						<a href={resolve('/(app)/catalog/products/new')} class="btn-primary">Nuevo producto</a>
					</Can>
				{/snippet}
			</EmptyState>
		{/if}
	{:else}
		<div class="overflow-x-auto">
			<table class="data-table">
				<thead>
					<tr>
						<th scope="col">Producto</th>
						<th scope="col" class="hidden md:table-cell">Categoría</th>
						<th scope="col" class="hidden lg:table-cell">Tipo</th>
						<th scope="col" class="numeric">Precio</th>
						<th scope="col" class="numeric hidden sm:table-cell">Impuesto</th>
						<th scope="col">Estado</th>
					</tr>
				</thead>
				<tbody>
					{#each data.products.items as product (product.id)}
						{@const badge = PRODUCT_STATUS_BADGES[product.status]}
						<tr>
							<td class="max-w-72">
								<a
									href={resolve('/(app)/catalog/products/[id=uuid]', { id: product.id })}
									class="block truncate font-medium text-label hover:text-accent"
								>
									{product.name}
								</a>
								<span class="block truncate font-mono text-xs text-label-secondary">
									{product.sku}
								</span>
							</td>
							<td class="hidden text-label-secondary md:table-cell">
								{product.categoryName ?? '—'}
							</td>
							<td class="hidden text-label-secondary lg:table-cell">
								{PRODUCT_TYPE_LABELS[product.type]}
							</td>
							<td class="numeric">{formatAmount(product.listPrice)}</td>
							<td class="numeric hidden text-label-secondary sm:table-cell">
								{formatPercent(product.taxRatePercent)}
							</td>
							<td><Badge tone={badge.tone} label={badge.label} /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>

<Pagination
	pageNumber={data.query.page}
	totalPages={data.products.totalPages}
	totalElements={data.products.totalElements}
	pageSize={data.pageSize}
	{hrefFor}
	itemsLabel="productos"
/>
