<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const roleNames = $derived(
		data.profile.roles.map((role) => role.name).join(', ') || 'Sin roles asignados'
	);
</script>

<svelte:head>
	<title>Inicio · SkyBu</title>
</svelte:head>

<h1 class="text-2xl font-semibold text-slate-900">Hola, {data.profile.fullName}</h1>

<dl class="mt-6 grid gap-4 sm:grid-cols-2">
	<div class="rounded-lg border border-slate-200 bg-white p-4">
		<dt class="text-sm text-slate-500">Roles</dt>
		<dd class="mt-1 font-medium text-slate-900">{roleNames}</dd>
	</div>
	<div class="rounded-lg border border-slate-200 bg-white p-4">
		<dt class="text-sm text-slate-500">Permisos efectivos</dt>
		<dd class="mt-1 font-medium text-slate-900">{data.principal.permissions.length}</dd>
	</div>
</dl>
