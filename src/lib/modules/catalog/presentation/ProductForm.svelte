<!--
	Formulario de producto, compartido por el alta y la edición. Con `readonly` (usuario sin
	permiso de gestión) se muestra la ficha deshabilitada: los mismos datos, sin poder enviarlos.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ResolvedPathname } from '$app/types';
	import FieldError from '#lib/shared/ui/FieldError.svelte';
	import Notice from '#lib/shared/ui/Notice.svelte';
	import { placeFieldErrors, type FormFailureView } from '#lib/shared/ui/form-failure.ts';
	import {
		PRODUCT_DESCRIPTION_MAX_LENGTH,
		PRODUCT_NAME_MAX_LENGTH,
		PRODUCT_TYPES,
		SKU_MAX_LENGTH,
		type Category,
		type Product
	} from '../domain/product';
	import {
		PRODUCT_ERROR_FIELDS,
		PRODUCT_TYPE_DESCRIPTIONS,
		PRODUCT_TYPE_LABELS
	} from './catalog-labels';

	interface Props {
		product?: Product;
		categories: readonly Category[];
		failure: FormFailureView | null;
		/** Acción del formulario (`?/save`); por defecto la acción por defecto de la página. */
		action?: string;
		submitLabel: string;
		readonly?: boolean;
		cancelHref?: ResolvedPathname;
	}

	let {
		product,
		categories,
		failure,
		action,
		submitLabel,
		readonly = false,
		cancelHref
	}: Props = $props();

	let submitting = $state(false);

	const errors = $derived(placeFieldErrors(failure, PRODUCT_ERROR_FIELDS));
	const fieldErrors = $derived(errors.fieldErrors);

	/** Tras un error se muestran los valores enviados; si no, los del producto (o vacíos). */
	const values = $derived({
		sku: failure?.values.sku ?? product?.sku ?? '',
		name: failure?.values.name ?? product?.name ?? '',
		description: failure?.values.description ?? product?.description ?? '',
		type: failure?.values.type ?? product?.type ?? 'GOODS',
		categoryId: failure?.values.categoryId ?? product?.categoryId ?? '',
		listPrice: failure?.values.listPrice ?? product?.listPrice.toFixed(2) ?? '',
		taxRatePercent: failure?.values.taxRatePercent ?? product?.taxRatePercent.toString() ?? ''
	});

	const describedBy = (field: string, hint?: string) =>
		[hint, fieldErrors[field] ? `${field}-error` : null].filter(Boolean).join(' ') || undefined;
</script>

<form
	method="POST"
	{action}
	novalidate
	class="panel max-w-3xl"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	<fieldset disabled={readonly} class="space-y-6 p-5 sm:p-6">
		<legend class="sr-only">Datos del producto</legend>

		{#if errors.formMessage}
			<Notice tone="error" message={errors.formMessage} />
		{/if}

		<div class="grid gap-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
			<div>
				<label for="name" class="field-label">Nombre</label>
				<input
					id="name"
					name="name"
					required
					maxlength={PRODUCT_NAME_MAX_LENGTH}
					value={values.name}
					aria-invalid={fieldErrors.name ? 'true' : undefined}
					aria-describedby={describedBy('name')}
					class="field-input mt-1.5"
				/>
				<FieldError id="name-error" messages={fieldErrors.name} />
			</div>
			<div>
				<label for="sku" class="field-label">SKU</label>
				<input
					id="sku"
					name="sku"
					required
					maxlength={SKU_MAX_LENGTH}
					autocapitalize="characters"
					spellcheck="false"
					value={values.sku}
					aria-invalid={fieldErrors.sku ? 'true' : undefined}
					aria-describedby={describedBy('sku', 'sku-hint')}
					class="field-input mt-1.5 font-mono uppercase"
				/>
				<p id="sku-hint" class="field-hint">Código único de referencia.</p>
				<FieldError id="sku-error" messages={fieldErrors.sku} />
			</div>
		</div>

		<fieldset>
			<legend class="field-label">Tipo</legend>
			<div class="mt-2 grid gap-2 sm:grid-cols-2">
				{#each PRODUCT_TYPES as type (type)}
					<label
						class="flex cursor-pointer gap-3 rounded-control border border-separator-strong p-3 has-checked:border-accent has-checked:bg-accent-fill has-disabled:cursor-default"
					>
						<input
							type="radio"
							name="type"
							value={type}
							checked={values.type === type}
							class="mt-0.5 border-separator-strong text-accent focus:ring-focus-ring"
						/>
						<span>
							<span class="block text-sm font-medium text-label">{PRODUCT_TYPE_LABELS[type]}</span>
							<span class="block text-xs text-label-secondary"
								>{PRODUCT_TYPE_DESCRIPTIONS[type]}</span
							>
						</span>
					</label>
				{/each}
			</div>
			<FieldError id="type-error" messages={fieldErrors.type} />
		</fieldset>

		<div>
			<label for="categoryId" class="field-label">Categoría</label>
			<select
				id="categoryId"
				name="categoryId"
				value={values.categoryId}
				aria-invalid={fieldErrors.categoryId ? 'true' : undefined}
				aria-describedby={describedBy('categoryId')}
				class="field-input mt-1.5 sm:max-w-sm"
			>
				<option value="">Sin categoría</option>
				{#each categories as category (category.id)}
					<option value={category.id}>{category.name}</option>
				{/each}
			</select>
			<FieldError id="categoryId-error" messages={fieldErrors.categoryId} />
		</div>

		<div class="grid gap-5 sm:grid-cols-2">
			<div>
				<label for="listPrice" class="field-label">Precio de lista</label>
				<input
					id="listPrice"
					name="listPrice"
					inputmode="decimal"
					required
					value={values.listPrice}
					aria-invalid={fieldErrors.listPrice ? 'true' : undefined}
					aria-describedby={describedBy('listPrice', 'listPrice-hint')}
					class="field-input mt-1.5 text-right tabular-nums"
				/>
				<p id="listPrice-hint" class="field-hint">Sin impuestos. Hasta dos decimales.</p>
				<FieldError id="listPrice-error" messages={fieldErrors.listPrice} />
			</div>
			<div>
				<label for="taxRatePercent" class="field-label">Impuesto (%)</label>
				<input
					id="taxRatePercent"
					name="taxRatePercent"
					inputmode="decimal"
					required
					value={values.taxRatePercent}
					aria-invalid={fieldErrors.taxRatePercent ? 'true' : undefined}
					aria-describedby={describedBy('taxRatePercent', 'taxRatePercent-hint')}
					class="field-input mt-1.5 text-right tabular-nums"
				/>
				<p id="taxRatePercent-hint" class="field-hint">Entre 0 y 100.</p>
				<FieldError id="taxRatePercent-error" messages={fieldErrors.taxRatePercent} />
			</div>
		</div>

		<div>
			<label for="description" class="field-label">
				Descripción <span class="font-normal text-label-secondary">(opcional)</span>
			</label>
			<textarea
				id="description"
				name="description"
				rows="3"
				maxlength={PRODUCT_DESCRIPTION_MAX_LENGTH}
				value={values.description}
				aria-invalid={fieldErrors.description ? 'true' : undefined}
				aria-describedby={describedBy('description')}
				class="field-input mt-1.5"></textarea>
			<FieldError id="description-error" messages={fieldErrors.description} />
		</div>
	</fieldset>

	{#if !readonly}
		<div
			class="flex flex-col-reverse gap-2 border-t border-separator px-5 py-4 sm:flex-row sm:justify-end sm:px-6"
		>
			{#if cancelHref}
				<a href={cancelHref} class="btn-secondary">Cancelar</a>
			{/if}
			<button type="submit" class="btn-primary" disabled={submitting}>
				{submitting ? 'Guardando…' : submitLabel}
			</button>
		</div>
	{/if}
</form>
