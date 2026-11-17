<!-- Estado del documento y, si es una cotización vencida, el aviso de vencimiento. -->
<script lang="ts">
	import Badge from '#lib/shared/ui/Badge.svelte';
	import { isExpired, type SalesOrderSummary } from '../domain/sales-order';
	import { EXPIRED_BADGE, STATUS_BADGES } from './sales-labels';

	interface Props {
		order: Pick<SalesOrderSummary, 'status' | 'validUntil'>;
		today: string;
	}

	let { order, today }: Props = $props();

	const badge = $derived(STATUS_BADGES[order.status]);
</script>

<span class="inline-flex flex-wrap gap-1">
	<Badge tone={badge.tone} label={badge.label} />
	{#if isExpired(order, today)}
		<Badge tone={EXPIRED_BADGE.tone} label={EXPIRED_BADGE.label} />
	{/if}
</span>
