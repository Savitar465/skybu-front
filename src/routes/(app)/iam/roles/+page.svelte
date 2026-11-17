<script lang="ts">
	import { Permissions } from '#lib/modules/auth/domain/permissions.ts';
	import Can from '#lib/modules/auth/presentation/Can.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Roles · SkyBu</title>
</svelte:head>

<div class="flex items-center justify-between">
	<h1 class="text-2xl font-semibold text-slate-900">Roles</h1>
	<Can requirement={Permissions.iam.rolesManage}>
		<span class="rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
			>Puedes gestionar roles</span
		>
		{#snippet fallback()}
			<span class="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-600">Solo lectura</span>
		{/snippet}
	</Can>
</div>

{#if data.roles.length === 0}
	<p class="mt-6 text-slate-500">Tu empresa todavía no tiene roles.</p>
{:else}
	<ul class="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
		{#each data.roles as role (role.id)}
			<li class="p-4">
				<div class="flex items-center gap-2">
					<h2 class="font-medium text-slate-900">{role.name}</h2>
					{#if role.systemRole}
						<span class="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">Sistema</span>
					{/if}
				</div>
				{#if role.description}
					<p class="mt-1 text-sm text-slate-500">{role.description}</p>
				{/if}
				<p class="mt-2 text-xs text-slate-400">{role.permissions.length} permisos</p>
			</li>
		{/each}
	</ul>
{/if}
