<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Permissions } from '#lib/modules/auth/domain/permissions.ts';
	import { can } from '#lib/modules/auth/presentation/authorization.ts';
	import Can from '#lib/modules/auth/presentation/Can.svelte';
	import { isActive } from '#lib/modules/catalog/domain/product.ts';
	import {
		CATALOG_NOTICES,
		PRODUCT_STATUS_BADGES
	} from '#lib/modules/catalog/presentation/catalog-labels.ts';
	import ProductForm from '#lib/modules/catalog/presentation/ProductForm.svelte';
	import { formatDateTime } from '#lib/shared/formatting/format.ts';
	import Badge from '#lib/shared/ui/Badge.svelte';
	import ConfirmDialog from '#lib/shared/ui/ConfirmDialog.svelte';
	import { formFailureOf } from '#lib/shared/ui/form-failure.ts';
	import Notice from '#lib/shared/ui/Notice.svelte';
	import PageHeader from '#lib/shared/ui/PageHeader.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const COMPLETED_NOTICES = {
		saved: 'Cambios guardados.',
		activated: 'Producto activado. Ya puede añadirse a cotizaciones.',
		deactivated: 'Producto desactivado. No podrá añadirse a cotizaciones nuevas.'
	} as const;

	const failure = $derived(formFailureOf(form));
	const badge = $derived(PRODUCT_STATUS_BADGES[data.product.status]);
	const successMessage = $derived(
		form?.completed
			? COMPLETED_NOTICES[form.completed]
			: data.notice && !form
				? CATALOG_NOTICES[data.notice]
				: null
	);
	/** Los fallos de activar/desactivar no tienen campos: se muestran arriba, no en el formulario. */
	const statusFailure = $derived(
		failure && Object.keys(failure.values).length === 0 ? failure : null
	);
	let activating = $state(false);
</script>

<svelte:head>
	<title>{data.product.name} · Productos · SkyBu</title>
</svelte:head>

<PageHeader
	title={data.product.name}
	subtitle="SKU {data.product.sku} · Creado el {formatDateTime(data.product.createdAt)}"
	back={{ href: resolve('/(app)/catalog/products'), label: 'Productos' }}
>
	{#snippet titleAccessory()}
		<Badge tone={badge.tone} label={badge.label} />
	{/snippet}
	{#snippet actions()}
		<Can requirement={Permissions.catalog.productsManage}>
			{#if isActive(data.product)}
				<ConfirmDialog
					triggerLabel="Desactivar"
					triggerClass="btn-danger"
					title="¿Desactivar «{data.product.name}»?"
					message="No podrá añadirse a cotizaciones nuevas. Los documentos que ya lo incluyen no cambian. Puedes volver a activarlo cuando quieras."
					confirmLabel="Desactivar"
					action="?/deactivate"
					tone="danger"
				/>
			{:else}
				<form
					method="POST"
					action="?/activate"
					use:enhance={() => {
						activating = true;
						return async ({ update }) => {
							await update();
							activating = false;
						};
					}}
				>
					<button type="submit" class="btn-secondary" disabled={activating}>
						{activating ? 'Activando…' : 'Activar'}
					</button>
				</form>
			{/if}
		</Can>
	{/snippet}
</PageHeader>

{#if successMessage}
	<Notice tone="success" message={successMessage} class="mb-4 max-w-3xl" />
{/if}
{#if statusFailure}
	<Notice tone="error" message={statusFailure.message} class="mb-4 max-w-3xl" />
{/if}

<ProductForm
	product={data.product}
	categories={data.categories}
	failure={statusFailure ? null : failure}
	action="?/save"
	submitLabel="Guardar cambios"
	readonly={!can(Permissions.catalog.productsManage)}
/>
