<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { can } from '#lib/modules/auth/presentation/authorization.ts';
	import Icon from '#lib/shared/ui/Icon.svelte';
	import { NAVIGATION, isCurrentSection } from './navigation';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	let menuOpen = $state(false);

	const sections = $derived(
		NAVIGATION.map((section) => ({
			...section,
			items: section.items.filter((item) => item.requirement === null || can(item.requirement))
		})).filter((section) => section.items.length > 0)
	);

	afterNavigate(() => {
		menuOpen = false;
	});
</script>

{#snippet navigation()}
	<nav aria-label="Principal" class="flex flex-col gap-5">
		{#each sections as section (section.title)}
			<div>
				{#if section.title}
					<p class="mb-1 px-2.5 text-xs font-medium text-label-tertiary">{section.title}</p>
				{/if}
				<ul class="space-y-0.5">
					{#each section.items as item (item.href)}
						{@const current = isCurrentSection(item, page.url.pathname)}
						<li>
							<a
								href={item.href}
								aria-current={current ? 'page' : undefined}
								class="flex items-center gap-2.5 rounded-control px-2.5 py-2 text-sm transition-colors lg:py-1.5 {current
									? 'bg-accent-fill font-medium text-accent'
									: 'text-label hover:bg-fill'}"
							>
								<Icon name={item.icon} size={17} />
								{item.label}
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>
{/snippet}

{#snippet account()}
	<div class="flex items-center gap-2 border-t border-separator pt-3">
		<a
			href={resolve('/(app)/account/password')}
			class="min-w-0 flex-1 rounded-control px-2.5 py-1.5 hover:bg-fill"
			title="Cambiar contraseña"
		>
			<span class="block truncate text-sm font-medium text-label">{data.profile.fullName}</span>
			<span class="block truncate text-xs text-label-secondary">{data.profile.email}</span>
		</a>
		<!-- Formulario nativo (sin enhance): recarga completa que descarta el estado del cliente. -->
		<form method="POST" action="/logout">
			<button type="submit" class="btn-icon" aria-label="Cerrar sesión" title="Cerrar sesión">
				<Icon name="logout" />
			</button>
		</form>
	</div>
{/snippet}

<div class="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
	<!-- Escritorio: barra lateral fija con los módulos. -->
	<aside
		class="sticky top-0 hidden h-dvh flex-col justify-between border-r border-separator bg-surface/80 px-3 py-4 backdrop-blur-xl lg:flex"
	>
		<div class="overflow-y-auto">
			<a href={resolve('/(app)')} class="text-headline mb-6 block px-2.5 text-label">SkyBu</a>
			{@render navigation()}
		</div>
		{@render account()}
	</aside>

	<!-- Móvil y tableta: barra superior con menú desplegable. -->
	<header
		class="sticky top-0 z-20 border-b border-separator bg-surface/85 backdrop-blur-xl lg:hidden"
	>
		<div class="flex h-14 items-center justify-between px-4">
			<a href={resolve('/(app)')} class="text-headline text-label">SkyBu</a>
			<button
				type="button"
				class="btn-icon"
				aria-expanded={menuOpen}
				aria-controls="mobile-menu"
				aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
				onclick={() => (menuOpen = !menuOpen)}
			>
				<Icon name={menuOpen ? 'close' : 'menu'} size={20} />
			</button>
		</div>
		{#if menuOpen}
			<div id="mobile-menu" class="max-h-[calc(100dvh-3.5rem)] overflow-y-auto px-3 pb-4">
				{@render navigation()}
				<div class="mt-4">{@render account()}</div>
			</div>
		{/if}
	</header>

	<main class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
		{@render children()}
	</main>
</div>
