<!-- Estado vacío: explica por qué no hay contenido y, si procede, ofrece la acción siguiente. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon, { type IconName } from './Icon.svelte';

	interface Props {
		title: string;
		description?: string;
		icon?: IconName;
		action?: Snippet;
	}

	let { title, description, icon, action }: Props = $props();
</script>

<div class="flex flex-col items-center px-6 py-14 text-center">
	{#if icon}
		<span class="mb-3 text-label-tertiary"><Icon name={icon} size={32} /></span>
	{/if}
	<p class="text-headline text-label">{title}</p>
	{#if description}
		<p class="mt-1 max-w-sm text-sm text-label-secondary">{description}</p>
	{/if}
	{#if action}
		<div class="mt-5">{@render action()}</div>
	{/if}
</div>
