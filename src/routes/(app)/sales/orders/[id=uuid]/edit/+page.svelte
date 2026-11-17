<script lang="ts">
	import { resolve } from '$app/paths';
	import { draftFromOrder } from '#lib/modules/sales/presentation/quotation-draft.ts';
	import QuotationEditor from '#lib/modules/sales/presentation/QuotationEditor.svelte';
	import { formFailureOf } from '#lib/shared/ui/form-failure.ts';
	import PageHeader from '#lib/shared/ui/PageHeader.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const detailPath = $derived(resolve('/(app)/sales/orders/[id=uuid]', { id: data.order.id }));
</script>

<svelte:head>
	<title>Editar {data.order.number} · SkyBu</title>
</svelte:head>

<PageHeader
	title="Editar {data.order.number}"
	subtitle="Borrador para {data.order.customerName}"
	back={{ href: detailPath, label: data.order.number }}
/>

<QuotationEditor
	initial={draftFromOrder(data.order)}
	today={data.today}
	currency={data.order.currency}
	failure={formFailureOf(form)}
	submitLabel="Guardar cambios"
	cancelHref={detailPath}
/>
