<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Error {page.status} · SkyBu</title>
</svelte:head>

<main class="flex min-h-dvh items-center justify-center px-4">
	<div class="max-w-md text-center">
		<p class="text-sm font-medium text-label-secondary">Error {page.status}</p>
		<h1 class="text-title mt-2 text-label">{page.error?.message}</h1>
		{#if page.error?.errorId}
			<p class="text-caption mt-2">Referencia: {page.error.errorId}</p>
		{/if}
		<a href={resolve('/(app)')} class="btn-secondary mt-6">Volver al inicio</a>
	</div>
</main>
