<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Permissions } from '#lib/modules/auth/domain/permissions.ts';
	import Can from '#lib/modules/auth/presentation/Can.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const isCurrent = (path: string) =>
		page.url.pathname === path || page.url.pathname.startsWith(`${path}/`);
</script>

<div class="min-h-screen bg-slate-50">
	<header class="border-b border-slate-200 bg-white">
		<div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
			<nav class="flex items-center gap-6 text-sm">
				<a href={resolve('/(app)')} class="font-semibold text-slate-900">SkyBu</a>
				<Can requirement={Permissions.iam.rolesRead}>
					<a
						href={resolve('/(app)/iam/roles')}
						class={isCurrent('/iam/roles')
							? 'text-blue-600'
							: 'text-slate-600 hover:text-slate-900'}
						aria-current={isCurrent('/iam/roles') ? 'page' : undefined}>Roles</a
					>
				</Can>
			</nav>

			<div class="flex items-center gap-4 text-sm">
				<a
					href={resolve('/(app)/account/password')}
					class="text-slate-600 hover:text-slate-900"
					title={data.profile.email}
				>
					{data.profile.fullName}
				</a>
				<!-- Formulario nativo (sin enhance): recarga completa que descarta el estado del cliente. -->
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
					>
						Cerrar sesión
					</button>
				</form>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-6xl px-4 py-8">
		{@render children()}
	</main>
</div>
