<script lang="ts">
	import { enhance } from '$app/forms';
	import { Permissions } from '#lib/modules/auth/domain/permissions.ts';
	import { can } from '#lib/modules/auth/presentation/authorization.ts';
	import Can from '#lib/modules/auth/presentation/Can.svelte';
	import { CATEGORY_NAME_MAX_LENGTH } from '#lib/modules/catalog/domain/product.ts';
	import { CATEGORY_ERROR_FIELDS } from '#lib/modules/catalog/presentation/catalog-labels.ts';
	import ConfirmDialog from '#lib/shared/ui/ConfirmDialog.svelte';
	import EmptyState from '#lib/shared/ui/EmptyState.svelte';
	import FieldError from '#lib/shared/ui/FieldError.svelte';
	import { formFailureOf, placeFieldErrors } from '#lib/shared/ui/form-failure.ts';
	import Icon from '#lib/shared/ui/Icon.svelte';
	import Notice from '#lib/shared/ui/Notice.svelte';
	import PageHeader from '#lib/shared/ui/PageHeader.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	/** Categoría que se está renombrando (solo una a la vez). */
	let editingId: string | null = $state(null);
	let pending: string | null = $state(null);

	/** Al abrir el renombrado, el foco pasa al campo que el usuario acaba de pedir editar. */
	const focusOnMount = (input: HTMLInputElement) => {
		input.focus();
		input.select();
	};

	const canManage = $derived(can(Permissions.catalog.categoriesManage));
	const failure = $derived(formFailureOf(form));
	const createFailure = $derived(failure?.values.intent === 'create' ? failure : null);
	const createErrors = $derived(placeFieldErrors(createFailure, CATEGORY_ERROR_FIELDS));
	const rowFailure = $derived(failure && failure.values.intent !== 'create' ? failure : null);
	const rowErrors = $derived(placeFieldErrors(rowFailure, CATEGORY_ERROR_FIELDS));

	const successMessage = $derived.by(() => {
		if (!form?.completed) return null;
		switch (form.completed) {
			case 'created':
				return `Categoría «${form.name}» creada.`;
			case 'renamed':
				return `Categoría renombrada a «${form.name}».`;
			case 'deleted':
				return 'Categoría eliminada.';
		}
	});

	/** Tras un error al renombrar se mantiene abierta la fila con el valor enviado. */
	$effect(() => {
		if (rowFailure?.values.intent === 'rename') {
			editingId = rowFailure.values.categoryId ?? null;
		}
	});
</script>

<svelte:head>
	<title>Categorías · SkyBu</title>
</svelte:head>

<PageHeader title="Categorías" subtitle="Agrupan los productos del catálogo." />

<div class="max-w-2xl space-y-4">
	{#if successMessage}
		<Notice tone="success" message={successMessage} />
	{/if}
	{#if rowErrors.formMessage}
		<Notice tone="error" message={rowErrors.formMessage} />
	{/if}

	<Can requirement={Permissions.catalog.categoriesManage}>
		<form
			method="POST"
			action="?/create"
			novalidate
			class="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-start"
			use:enhance={() => {
				pending = 'create';
				return async ({ update }) => {
					await update();
					pending = null;
				};
			}}
		>
			<div class="flex-1">
				<label for="new-category" class="sr-only">Nombre de la nueva categoría</label>
				<input
					id="new-category"
					name="name"
					required
					maxlength={CATEGORY_NAME_MAX_LENGTH}
					placeholder="Nueva categoría"
					value={createFailure?.values.name ?? ''}
					aria-invalid={createErrors.fieldErrors.name ? 'true' : undefined}
					aria-describedby={createErrors.fieldErrors.name ? 'new-category-error' : undefined}
					class="field-input"
				/>
				<FieldError id="new-category-error" messages={createErrors.fieldErrors.name} />
				{#if createErrors.formMessage}
					<p class="mt-1.5 text-sm text-danger" role="alert">{createErrors.formMessage}</p>
				{/if}
			</div>
			<button type="submit" class="btn-primary" disabled={pending === 'create'}>
				<Icon name="plus" size={16} />
				{pending === 'create' ? 'Creando…' : 'Añadir'}
			</button>
		</form>
	</Can>

	<section class="panel overflow-hidden" aria-label="Categorías">
		{#if data.categories.length === 0}
			<EmptyState
				icon="tag"
				title="Aún no hay categorías"
				description="Son opcionales: sirven para ordenar el catálogo y filtrar informes."
			/>
		{:else}
			<ul class="divide-y divide-separator">
				{#each data.categories as category (category.id)}
					<li class="flex min-h-14 items-center gap-3 px-4 py-2.5">
						{#if editingId === category.id}
							<form
								method="POST"
								action="?/rename"
								novalidate
								class="flex flex-1 flex-col gap-2 sm:flex-row sm:items-start"
								use:enhance={() => {
									pending = category.id;
									return async ({ result, update }) => {
										await update();
										pending = null;
										if (result.type === 'success') editingId = null;
									};
								}}
							>
								<input type="hidden" name="categoryId" value={category.id} />
								<div class="flex-1">
									<label for="rename-{category.id}" class="sr-only">
										Nuevo nombre de «{category.name}»
									</label>
									<input
										id="rename-{category.id}"
										name="name"
										required
										{@attach focusOnMount}
										maxlength={CATEGORY_NAME_MAX_LENGTH}
										value={rowFailure?.values.categoryId === category.id
											? (rowFailure.values.name ?? category.name)
											: category.name}
										aria-invalid={rowErrors.fieldErrors.name ? 'true' : undefined}
										aria-describedby={rowErrors.fieldErrors.name
											? `rename-${category.id}-error`
											: undefined}
										class="field-input"
										onkeydown={(event) => {
											if (event.key === 'Escape') editingId = null;
										}}
									/>
									<FieldError
										id="rename-{category.id}-error"
										messages={rowFailure?.values.categoryId === category.id
											? rowErrors.fieldErrors.name
											: undefined}
									/>
								</div>
								<div class="flex gap-2">
									<button type="button" class="btn-secondary" onclick={() => (editingId = null)}>
										Cancelar
									</button>
									<button type="submit" class="btn-primary" disabled={pending === category.id}>
										{pending === category.id ? 'Guardando…' : 'Guardar'}
									</button>
								</div>
							</form>
						{:else}
							<span class="flex-1 text-sm text-label">{category.name}</span>
							{#if canManage}
								<button
									type="button"
									class="btn-plain"
									aria-label="Renombrar «{category.name}»"
									onclick={() => (editingId = category.id)}
								>
									Renombrar
								</button>
								<ConfirmDialog
									triggerLabel="Eliminar"
									triggerClass="btn-plain text-danger hover:bg-danger-fill"
									title="¿Eliminar «{category.name}»?"
									message="Solo se pueden eliminar categorías sin productos. Esta acción no se puede deshacer."
									confirmLabel="Eliminar"
									action="?/delete"
									tone="danger"
								>
									{#snippet fields()}
										<input type="hidden" name="categoryId" value={category.id} />
									{/snippet}
								</ConfirmDialog>
							{/if}
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
