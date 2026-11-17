<!--
	Paginación de listados con enlaces reales (funciona sin JavaScript y la página queda en la
	URL, así que se puede compartir o volver atrás). Muestra el rango visible y anterior/siguiente.
-->
<script lang="ts">
	import type { ResolvedPathname } from '$app/types';
	import Icon from './Icon.svelte';

	interface Props {
		/** Página visible, empezando en 1. */
		pageNumber: number;
		totalPages: number;
		totalElements: number;
		pageSize: number;
		/** URL de una página; debe construirse con `resolve()` en la página que usa el componente. */
		hrefFor: (pageNumber: number) => ResolvedPathname;
		/** Nombre de los elementos en plural, p. ej. «productos». */
		itemsLabel: string;
	}

	let { pageNumber, totalPages, totalElements, pageSize, hrefFor, itemsLabel }: Props = $props();

	const firstItem = $derived(totalElements === 0 ? 0 : (pageNumber - 1) * pageSize + 1);
	const lastItem = $derived(Math.min(pageNumber * pageSize, totalElements));
	const hasPrevious = $derived(pageNumber > 1);
	const hasNext = $derived(pageNumber < totalPages);
</script>

{#if totalElements > 0}
	<nav
		class="flex items-center justify-between gap-4 px-1 pt-4 text-sm"
		aria-label="Paginación de {itemsLabel}"
	>
		<p class="text-label-secondary tabular-nums">
			{firstItem}–{lastItem} de {totalElements}
			{itemsLabel}
		</p>
		{#if totalPages > 1}
			<div class="flex items-center gap-1">
				{#if hasPrevious}
					<a href={hrefFor(pageNumber - 1)} class="btn-icon" aria-label="Página anterior">
						<Icon name="chevronLeft" />
					</a>
				{:else}
					<span class="btn-icon opacity-35" aria-hidden="true"><Icon name="chevronLeft" /></span>
				{/if}
				<span class="px-2 text-label-secondary tabular-nums">
					Página {pageNumber} de {totalPages}
				</span>
				{#if hasNext}
					<a href={hrefFor(pageNumber + 1)} class="btn-icon" aria-label="Página siguiente">
						<Icon name="chevronRight" />
					</a>
				{:else}
					<span class="btn-icon opacity-35" aria-hidden="true"><Icon name="chevronRight" /></span>
				{/if}
			</div>
		{/if}
	</nav>
{/if}
