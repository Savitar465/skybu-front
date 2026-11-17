<script lang="ts">
	import { can } from '#lib/modules/auth/presentation/authorization.ts';
	import Icon from '#lib/shared/ui/Icon.svelte';
	import PageHeader from '#lib/shared/ui/PageHeader.svelte';
	import { NAVIGATION } from './navigation';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const roleNames = $derived(
		data.profile.roles.map((role) => role.name).join(', ') || 'Sin roles asignados'
	);

	/** Accesos directos: las secciones de módulo a las que el usuario tiene acceso. */
	const shortcuts = $derived(
		NAVIGATION.filter((section) => section.title !== null)
			.flatMap((section) => section.items)
			.filter((item) => item.requirement === null || can(item.requirement))
	);
</script>

<svelte:head>
	<title>Inicio · SkyBu</title>
</svelte:head>

<PageHeader title="Hola, {data.profile.fullName}" subtitle={roleNames} />

{#if shortcuts.length > 0}
	<section aria-labelledby="shortcuts-title">
		<h2 id="shortcuts-title" class="mb-3 text-sm font-medium text-label-secondary">Ir a</h2>
		<ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each shortcuts as item (item.href)}
				<li>
					<a
						href={item.href}
						class="panel flex items-center gap-3 p-4 transition-colors hover:bg-fill"
					>
						<span class="text-accent"><Icon name={item.icon} size={20} /></span>
						<span class="text-sm font-medium text-label">{item.label}</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>
{:else}
	<p class="text-sm text-label-secondary">
		Tu usuario todavía no tiene acceso a ningún módulo. Pide a un administrador que te asigne un
		rol.
	</p>
{/if}
