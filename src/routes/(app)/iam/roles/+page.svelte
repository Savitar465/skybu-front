<script lang="ts">
	import { Permissions } from '#lib/modules/auth/domain/permissions.ts';
	import Can from '#lib/modules/auth/presentation/Can.svelte';
	import Badge from '#lib/shared/ui/Badge.svelte';
	import EmptyState from '#lib/shared/ui/EmptyState.svelte';
	import PageHeader from '#lib/shared/ui/PageHeader.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Roles · SkyBu</title>
</svelte:head>

<PageHeader title="Roles" subtitle="Conjuntos de permisos que se asignan a los usuarios.">
	{#snippet titleAccessory()}
		<Can requirement={Permissions.iam.rolesManage}>
			<Badge tone="accent" label="Puedes gestionar roles" />
			{#snippet fallback()}
				<Badge label="Solo lectura" />
			{/snippet}
		</Can>
	{/snippet}
</PageHeader>

<section class="panel overflow-hidden" aria-label="Roles">
	{#if data.roles.length === 0}
		<EmptyState icon="shield" title="Tu empresa todavía no tiene roles." />
	{:else}
		<ul class="divide-y divide-separator">
			{#each data.roles as role (role.id)}
				<li class="px-5 py-4">
					<div class="flex items-center gap-2">
						<h2 class="font-medium text-label">{role.name}</h2>
						{#if role.systemRole}
							<Badge label="Sistema" />
						{/if}
					</div>
					{#if role.description}
						<p class="mt-1 text-sm text-label-secondary">{role.description}</p>
					{/if}
					<p class="text-caption mt-2">{role.permissions.length} permisos</p>
				</li>
			{/each}
		</ul>
	{/if}
</section>
