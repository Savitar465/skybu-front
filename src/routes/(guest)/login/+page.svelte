<script lang="ts">
	import { enhance } from '$app/forms';
	import FieldError from '#lib/shared/ui/FieldError.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let submitting = $state(false);

	const fieldErrors = $derived(form?.fieldErrors ?? {});
	// Con credenciales incorrectas se muestra un mensaje general, no por campo: la API no
	// revela (a propósito) si el correo existe o si la cuenta está bloqueada.
	const formMessage = $derived(form && Object.keys(fieldErrors).length === 0 ? form.message : null);
</script>

<svelte:head>
	<title>Iniciar sesión · SkyBu</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
	<div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
		<h1 class="text-2xl font-semibold text-slate-900">Iniciar sesión</h1>
		<p class="mt-1 text-sm text-slate-500">Accede a tu empresa en SkyBu.</p>

		{#if data.notice && !form}
			<p class="mt-6 rounded-md bg-blue-50 p-3 text-sm text-blue-800" role="status">
				{data.notice}
			</p>
		{/if}

		{#if formMessage}
			<p class="mt-6 rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">{formMessage}</p>
		{/if}

		<form
			method="POST"
			class="mt-6 space-y-4"
			novalidate
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					// `reset: false` conserva el correo; la contraseña se borra al fallar.
					await update({ reset: false });
					submitting = false;
				};
			}}
		>
			<div>
				<label for="email" class="block text-sm font-medium text-slate-700"
					>Correo electrónico</label
				>
				<input
					id="email"
					name="email"
					type="email"
					autocomplete="username"
					required
					maxlength="254"
					value={form?.values.email ?? ''}
					aria-invalid={fieldErrors.email ? 'true' : undefined}
					aria-describedby={fieldErrors.email ? 'email-error' : undefined}
					class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				/>
				<FieldError id="email-error" messages={fieldErrors.email} />
			</div>

			<div>
				<label for="password" class="block text-sm font-medium text-slate-700">Contraseña</label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
					maxlength="128"
					aria-invalid={fieldErrors.password ? 'true' : undefined}
					aria-describedby={fieldErrors.password ? 'password-error' : undefined}
					class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				/>
				<FieldError id="password-error" messages={fieldErrors.password} />
			</div>

			<button
				type="submit"
				disabled={submitting}
				class="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{submitting ? 'Entrando…' : 'Entrar'}
			</button>
		</form>
	</div>
</main>
