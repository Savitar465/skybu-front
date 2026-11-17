<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		NEW_PASSWORD_MAX_LENGTH,
		NEW_PASSWORD_MIN_LENGTH
	} from '#lib/modules/auth/application/dto/change-password-input.ts';
	import FieldError from '#lib/shared/ui/FieldError.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	let submitting = $state(false);

	/** Los errores de negocio de la API se colocan junto al campo al que se refieren. */
	const API_ERROR_FIELDS: Readonly<Record<string, string>> = {
		incorrect_current_password: 'currentPassword',
		weak_password: 'newPassword'
	};

	const fieldErrors = $derived.by((): Readonly<Record<string, readonly string[]>> => {
		if (!form) return {};
		const field = API_ERROR_FIELDS[form.code];
		return field ? { ...form.fieldErrors, [field]: [form.message] } : form.fieldErrors;
	});
	const formMessage = $derived(form && Object.keys(fieldErrors).length === 0 ? form.message : null);

	const fields = [
		{
			name: 'currentPassword',
			label: 'Contraseña actual',
			autocomplete: 'current-password',
			maxlength: 128
		},
		{
			name: 'newPassword',
			label: 'Nueva contraseña',
			autocomplete: 'new-password',
			maxlength: NEW_PASSWORD_MAX_LENGTH
		},
		{
			name: 'newPasswordConfirmation',
			label: 'Repite la nueva contraseña',
			autocomplete: 'new-password',
			maxlength: NEW_PASSWORD_MAX_LENGTH
		}
	] as const;
</script>

<svelte:head>
	<title>Cambiar contraseña · SkyBu</title>
</svelte:head>

<div class="max-w-md">
	<h1 class="text-2xl font-semibold text-slate-900">Cambiar contraseña</h1>
	<p class="mt-1 text-sm text-slate-500">
		Mínimo {NEW_PASSWORD_MIN_LENGTH} caracteres. Al cambiarla se cerrarán tus sesiones en todos los dispositivos.
	</p>

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
				await update();
				submitting = false;
			};
		}}
	>
		{#each fields as field (field.name)}
			<div>
				<label for={field.name} class="block text-sm font-medium text-slate-700"
					>{field.label}</label
				>
				<input
					id={field.name}
					name={field.name}
					type="password"
					required
					autocomplete={field.autocomplete}
					maxlength={field.maxlength}
					aria-invalid={fieldErrors[field.name] ? 'true' : undefined}
					aria-describedby={fieldErrors[field.name] ? `${field.name}-error` : undefined}
					class="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
				/>
				<FieldError id="{field.name}-error" messages={fieldErrors[field.name]} />
			</div>
		{/each}

		<button
			type="submit"
			disabled={submitting}
			class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{submitting ? 'Guardando…' : 'Cambiar contraseña'}
		</button>
	</form>
</div>
