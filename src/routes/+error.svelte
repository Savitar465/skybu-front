<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>Error {page.status} · SkyBu</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
	<div class="max-w-md text-center">
		<p class="text-sm font-semibold text-slate-500">Error {page.status}</p>
		<h1 class="mt-2 text-2xl font-semibold text-slate-900">{page.error?.message}</h1>
		{#if page.error?.errorId}
			<p class="mt-2 text-xs text-slate-400">Referencia: {page.error.errorId}</p>
		{/if}
		<a href={resolve('/(app)')} class="mt-6 inline-block text-blue-600 hover:underline"
			>Volver al inicio</a
		>
	</div>
</main>
