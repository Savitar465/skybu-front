<!--
	Control segmentado para filtrar un listado. Cada segmento es un enlace (el filtro vive en la
	URL); el activo se marca con `aria-current`. Se desplaza en horizontal si no cabe en móvil.
-->
<script lang="ts">
	import type { ResolvedPathname } from '$app/types';

	interface Tab {
		readonly label: string;
		/** URL construida con `resolve()` en la página. */
		readonly href: ResolvedPathname;
		readonly current: boolean;
	}

	interface Props {
		tabs: readonly Tab[];
		label: string;
	}

	let { tabs, label }: Props = $props();
</script>

<nav aria-label={label} class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
	<ul class="inline-flex gap-0.5 rounded-control bg-fill p-0.5 text-sm">
		{#each tabs as tab (tab.href)}
			<li>
				<a
					href={tab.href}
					aria-current={tab.current ? 'page' : undefined}
					data-sveltekit-noscroll
					class="block rounded-[calc(var(--radius-control)-2px)] px-3 py-1.5 whitespace-nowrap transition-colors {tab.current
						? 'bg-surface font-medium text-label shadow-sm'
						: 'text-label-secondary hover:text-label'}"
				>
					{tab.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>
