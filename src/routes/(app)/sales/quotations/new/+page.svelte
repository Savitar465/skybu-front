<script lang="ts">
	import { resolve } from '$app/paths';
	import { emptyDraft } from '#lib/modules/sales/presentation/quotation-draft.ts';
	import QuotationEditor from '#lib/modules/sales/presentation/QuotationEditor.svelte';
	import { formFailureOf } from '#lib/shared/ui/form-failure.ts';
	import PageHeader from '#lib/shared/ui/PageHeader.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const listPath = resolve('/(app)/sales/quotations');
</script>

<svelte:head>
	<title>Nueva cotización · SkyBu</title>
</svelte:head>

<PageHeader
	title="Nueva cotización"
	subtitle="Se guarda como borrador; podrás revisarla antes de enviarla al cliente."
	back={{ href: listPath, label: 'Cotizaciones' }}
/>

<QuotationEditor
	initial={emptyDraft()}
	today={data.today}
	currency={null}
	failure={formFailureOf(form)}
	submitLabel="Guardar borrador"
	cancelHref={listPath}
/>
