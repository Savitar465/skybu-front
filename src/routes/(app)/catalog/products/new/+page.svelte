<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductForm from '#lib/modules/catalog/presentation/ProductForm.svelte';
	import { formFailureOf } from '#lib/shared/ui/form-failure.ts';
	import PageHeader from '#lib/shared/ui/PageHeader.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const listPath = resolve('/(app)/catalog/products');
</script>

<svelte:head>
	<title>Nuevo producto · SkyBu</title>
</svelte:head>

<PageHeader title="Nuevo producto" back={{ href: listPath, label: 'Productos' }} />

<ProductForm
	categories={data.categories}
	failure={formFailureOf(form)}
	submitLabel="Crear producto"
	cancelHref={listPath}
/>
