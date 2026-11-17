<!--
	Confirmación de una acción con consecuencias (cancelar un pedido, desactivar, eliminar).
	Usa `<dialog>` nativo en modo modal: el navegador gestiona el foco, `Esc` y la inercia del
	fondo. Al confirmar se envía un formulario POST a la acción indicada (con `use:enhance`).
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { enhance } from '$app/forms';

	interface Props {
		triggerLabel: string;
		triggerClass?: string;
		title: string;
		message: string;
		confirmLabel: string;
		/** Acción del formulario, p. ej. `?/cancel`. */
		action: string;
		tone?: 'default' | 'danger';
		/** Campos ocultos adicionales del formulario (p. ej. el id del elemento). */
		fields?: Snippet;
	}

	let {
		triggerLabel,
		triggerClass = 'btn-secondary',
		title,
		message,
		confirmLabel,
		action,
		tone = 'default',
		fields
	}: Props = $props();

	const titleId = $props.id();
	let dialog: HTMLDialogElement | undefined = $state();
	let submitting = $state(false);
</script>

<button type="button" class={triggerClass} onclick={() => dialog?.showModal()}>
	{triggerLabel}
</button>

<dialog
	bind:this={dialog}
	aria-labelledby={titleId}
	class="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-panel bg-surface-raised p-0 text-label shadow-popover backdrop:bg-black/35"
>
	<form
		method="POST"
		{action}
		class="p-5"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				dialog?.close();
				await update();
				submitting = false;
			};
		}}
	>
		{@render fields?.()}
		<h2 id={titleId} class="text-headline">{title}</h2>
		<p class="mt-2 text-sm text-label-secondary">{message}</p>
		<div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
			<button type="button" class="btn-secondary" onclick={() => dialog?.close()}>Volver</button>
			<button
				type="submit"
				class={tone === 'danger' ? 'btn-danger-filled' : 'btn-primary'}
				disabled={submitting}
			>
				{submitting ? 'Procesando…' : confirmLabel}
			</button>
		</div>
	</form>
</dialog>
