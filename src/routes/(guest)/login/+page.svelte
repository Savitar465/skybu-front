<script lang="ts">
	import { enhance } from '$app/forms';
	import FieldError from '#lib/shared/ui/FieldError.svelte';
	import Notice from '#lib/shared/ui/Notice.svelte';
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

<main class="flex min-h-dvh items-center justify-center px-4">
	<div class="panel w-full max-w-sm p-8">
		<h1 class="text-title text-label">Iniciar sesión</h1>
		<p class="mt-1 text-sm text-label-secondary">Accede a tu empresa en SkyBu.</p>

		{#if data.notice && !form}
			<Notice tone="info" message={data.notice} class="mt-6" />
		{/if}

		{#if formMessage}
			<Notice tone="error" message={formMessage} class="mt-6" />
		{/if}

		<form
			method="POST"
			class="mt-6 space-y-5"
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
				<label for="email" class="field-label">Correo electrónico</label>
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
					class="field-input mt-1.5"
				/>
				<FieldError id="email-error" messages={fieldErrors.email} />
			</div>

			<div>
				<label for="password" class="field-label">Contraseña</label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
					maxlength="128"
					aria-invalid={fieldErrors.password ? 'true' : undefined}
					aria-describedby={fieldErrors.password ? 'password-error' : undefined}
					class="field-input mt-1.5"
				/>
				<FieldError id="password-error" messages={fieldErrors.password} />
			</div>

			<button type="submit" disabled={submitting} class="btn-primary w-full">
				{submitting ? 'Entrando…' : 'Entrar'}
			</button>
		</form>
	</div>
</main>
