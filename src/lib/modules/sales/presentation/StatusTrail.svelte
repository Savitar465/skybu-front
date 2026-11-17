<!--
	Recorrido del documento (como la barra de estado de Odoo): Borrador → Enviada → Pedido.
	Un documento cancelado lo indica en lugar del recorrido. Es informativo: las acciones están
	en la cabecera.
-->
<script lang="ts">
	import type { SalesOrderStatus } from '../domain/sales-order';

	interface Props {
		status: SalesOrderStatus;
	}

	let { status }: Props = $props();

	const STEPS = [
		{ status: 'DRAFT', label: 'Borrador' },
		{ status: 'SENT', label: 'Enviada' },
		{ status: 'CONFIRMED', label: 'Pedido de venta' }
	] as const;

	const currentIndex = $derived(STEPS.findIndex((step) => step.status === status));
</script>

{#if status === 'CANCELLED'}
	<p class="text-sm text-label-secondary">Documento cancelado</p>
{:else}
	<ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm" aria-label="Estado del documento">
		{#each STEPS as step, index (step.status)}
			<li class="flex items-center gap-2">
				<span
					aria-current={index === currentIndex ? 'step' : undefined}
					class={index === currentIndex
						? 'font-medium text-accent'
						: index < currentIndex
							? 'text-label'
							: 'text-label-tertiary'}
				>
					{step.label}
				</span>
				{#if index < STEPS.length - 1}
					<span class="text-label-tertiary" aria-hidden="true">›</span>
				{/if}
			</li>
		{/each}
	</ol>
{/if}
