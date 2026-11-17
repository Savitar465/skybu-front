<script lang="ts">
	import { enhance } from '$app/forms';
	import {
		NEW_PASSWORD_MAX_LENGTH,
		NEW_PASSWORD_MIN_LENGTH
	} from '#lib/modules/auth/application/dto/change-password-input.ts';
	import FieldError from '#lib/shared/ui/FieldError.svelte';
	import Notice from '#lib/shared/ui/Notice.svelte';
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
	<h1 class="text-title text-label">Cambiar contraseña</h1>
	<p class="mt-1 text-sm text-label-secondary">
		Mínimo {NEW_PASSWORD_MIN_LENGTH} caracteres. Al cambiarla se cerrarán tus sesiones en todos los dispositivos.
	</p>

	{#if formMessage}
		<Notice tone="error" message={formMessage} class="mt-6" />
	{/if}

	<form
		method="POST"
		class="panel mt-6 space-y-5 p-5 sm:p-6"
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
				<label for={field.name} class="field-label">{field.label}</label>
				<input
					id={field.name}
					name={field.name}
					type="password"
					required
					autocomplete={field.autocomplete}
					maxlength={field.maxlength}
					aria-invalid={fieldErrors[field.name] ? 'true' : undefined}
					aria-describedby={fieldErrors[field.name] ? `${field.name}-error` : undefined}
					class="field-input mt-1.5"
				/>
				<FieldError id="{field.name}-error" messages={fieldErrors[field.name]} />
			</div>
		{/each}

		<button type="submit" disabled={submitting} class="btn-primary">
			{submitting ? 'Guardando…' : 'Cambiar contraseña'}
		</button>
	</form>
</div>
