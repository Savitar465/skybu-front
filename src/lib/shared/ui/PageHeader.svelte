<!--
	Cabecera de pantalla: miga de pan opcional (para pantallas de detalle), título, subtítulo y
	acciones principales. En pantallas pequeñas las acciones pasan debajo del título.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ResolvedPathname } from '$app/types';
	import Icon from './Icon.svelte';

	interface Props {
		title: string;
		subtitle?: string;
		/** Enlace de vuelta al listado padre. */
		back?: { readonly href: ResolvedPathname; readonly label: string };
		/** Contenido junto al título (p. ej. un badge de estado). */
		titleAccessory?: Snippet;
		actions?: Snippet;
	}

	let { title, subtitle, back, titleAccessory, actions }: Props = $props();
</script>

<header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
	<div class="min-w-0">
		{#if back}
			<a
				href={back.href}
				class="mb-1 -ml-1 inline-flex items-center gap-0.5 rounded-control px-1 text-sm text-accent hover:underline"
			>
				<Icon name="chevronLeft" size={16} />
				{back.label}
			</a>
		{/if}
		<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
			<h1 class="text-title text-label">{title}</h1>
			{@render titleAccessory?.()}
		</div>
		{#if subtitle}
			<p class="mt-1 text-sm text-label-secondary">{subtitle}</p>
		{/if}
	</div>
	{#if actions}
		<div class="flex flex-wrap items-center gap-2">
			{@render actions()}
		</div>
	{/if}
</header>
