<!--
	Editor de cotizaciones (alta y edición de un borrador): cliente, validez, líneas y notas, con
	vista previa de importes mientras se escribe.

	Es un formulario normal: las líneas se envían como campos repetidos (`lines.productId`,
	`lines.quantity`, `lines.discountPercent`) que el servidor reagrupa por posición. El precio y
	el impuesto no se envían: los fija la API desde el catálogo.
-->
<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import type { ResolvedPathname } from '$app/types';
	import { formatAmount, formatMoney, formatPercent } from '#lib/shared/formatting/format.ts';
	import Combobox from '#lib/shared/ui/Combobox.svelte';
	import FieldError from '#lib/shared/ui/FieldError.svelte';
	import { placeFieldErrors, type FormFailureView } from '#lib/shared/ui/form-failure.ts';
	import Icon from '#lib/shared/ui/Icon.svelte';
	import Notice from '#lib/shared/ui/Notice.svelte';
	import {
		calculateLineAmounts,
		centsToAmount,
		sumAmounts,
		type LineAmounts
	} from '../domain/line-amounts';
	import { MAX_NOTES_LENGTH, MAX_ORDER_LINES } from '../domain/sales-order';
	import type { CustomerOption, ProductOption } from '../application/dto/lookup-options';
	import { searchCustomers, searchProducts } from './lookup-client';
	import { newDraftLine, type QuotationDraft } from './quotation-draft';
	import { QUOTATION_ERROR_FIELDS } from './sales-labels';

	interface Props {
		initial: QuotationDraft;
		/** Fecha de hoy (`AAAA-MM-DD`): mínimo de la validez. */
		today: string;
		/** Moneda del documento si ya existe; en uno nuevo la decide la API al guardarlo. */
		currency: string | null;
		failure: FormFailureView | null;
		submitLabel: string;
		cancelHref: ResolvedPathname;
	}

	let { initial, today, currency, failure, submitLabel, cancelHref }: Props = $props();

	// El editor trabaja sobre su propia copia: `initial` solo fija el punto de partida.
	const draft: QuotationDraft = $state(untrack(() => structuredClone(initial)));
	let submitting = $state(false);
	let addLineButton: HTMLButtonElement | undefined = $state();

	const errors = $derived(placeFieldErrors(failure, QUOTATION_ERROR_FIELDS));
	const fieldErrors = $derived(errors.fieldErrors);

	const lineAmounts = $derived(
		draft.lines.map((line): LineAmounts | null =>
			line.product
				? calculateLineAmounts({
						quantity: line.quantity,
						unitPrice: line.product.listPrice,
						discountPercent: line.discountPercent,
						taxRatePercent: line.product.taxRatePercent
					})
				: null
		)
	);
	const totals = $derived(
		sumAmounts(lineAmounts.filter((amounts): amounts is LineAmounts => amounts !== null))
	);
	const hasIncompleteLines = $derived(lineAmounts.some((amounts) => amounts === null));

	function money(cents: bigint): string {
		const amount = centsToAmount(cents);
		return currency ? formatMoney(amount, currency) : formatAmount(amount);
	}

	async function addLine() {
		const line = newDraftLine();
		draft.lines.push(line);
		await tick();
		document.getElementById(`line-${line.key}-product`)?.focus();
	}

	function removeLine(key: string) {
		draft.lines = draft.lines.filter((line) => line.key !== key);
		addLineButton?.focus();
	}

	const lineError = (index: number, field: string) => fieldErrors[`lines.${index}.${field}`];
	const errorId = (key: string, field: string) => `line-${key}-${field}-error`;
</script>

{#snippet customerOption(customer: CustomerOption)}
	<span class="block font-medium">{customer.name}</span>
	{#if customer.taxId}
		<span class="block text-xs opacity-75">NIT {customer.taxId}</span>
	{/if}
{/snippet}

{#snippet productOption(product: ProductOption)}
	<span class="flex items-baseline justify-between gap-3">
		<span class="min-w-0">
			<span class="block truncate font-medium">{product.name}</span>
			<span class="block font-mono text-xs opacity-75">{product.sku}</span>
		</span>
		<span class="shrink-0 tabular-nums">{formatAmount(product.listPrice)}</span>
	</span>
{/snippet}

<form
	method="POST"
	novalidate
	class="space-y-6"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	{#if errors.formMessage}
		<Notice tone="error" message={errors.formMessage} />
	{/if}

	<section class="panel grid gap-5 p-5 sm:grid-cols-2 sm:p-6" aria-label="Datos generales">
		<div>
			<label for="customer" class="field-label">Cliente</label>
			<div class="mt-1.5">
				<Combobox
					id="customer"
					name="customerId"
					bind:selected={draft.customer}
					search={searchCustomers}
					optionLabel={(customer) => customer.name}
					optionContent={customerOption}
					placeholder="Buscar por nombre, NIT o correo"
					invalid={Boolean(fieldErrors.customerId)}
					describedBy={fieldErrors.customerId ? 'customer-error' : undefined}
				/>
			</div>
			<FieldError id="customer-error" messages={fieldErrors.customerId} />
		</div>
		<div>
			<label for="validUntil" class="field-label">Válida hasta</label>
			<input
				id="validUntil"
				name="validUntil"
				type="date"
				min={today}
				bind:value={draft.validUntil}
				aria-invalid={fieldErrors.validUntil ? 'true' : undefined}
				aria-describedby="validUntil-hint{fieldErrors.validUntil ? ' validUntil-error' : ''}"
				class="field-input mt-1.5 sm:max-w-56"
			/>
			<p id="validUntil-hint" class="field-hint">
				Si la dejas vacía se aplica la validez por defecto de tu empresa.
			</p>
			<FieldError id="validUntil-error" messages={fieldErrors.validUntil} />
		</div>
	</section>

	<section class="panel" aria-labelledby="lines-title">
		<header class="flex items-baseline justify-between px-5 pt-4 pb-3 sm:px-6">
			<h2 id="lines-title" class="text-headline">Líneas</h2>
			<span class="text-caption tabular-nums">{draft.lines.length} de {MAX_ORDER_LINES}</span>
		</header>

		<!-- Cabecera de columnas solo en pantallas anchas; en móvil cada campo lleva su etiqueta. -->
		<div
			class="hidden border-y border-separator px-6 py-2 text-xs font-medium text-label-secondary md:grid md:grid-cols-[minmax(0,1fr)_6.5rem_5.5rem_7rem_8rem_2.25rem] md:gap-3"
			aria-hidden="true"
		>
			<span>Producto</span>
			<span class="text-right">Cantidad</span>
			<span class="text-right">Desc. %</span>
			<span class="text-right">Precio unit.</span>
			<span class="text-right">Subtotal</span>
			<span></span>
		</div>

		{#if draft.lines.length === 0}
			<p class="border-t border-separator px-6 py-8 text-center text-sm text-label-secondary">
				Añade los productos o servicios que vas a cotizar. Puedes guardar el borrador sin líneas,
				pero no enviarlo ni confirmarlo.
			</p>
		{/if}

		<ol class="divide-y divide-separator">
			{#each draft.lines as line, index (line.key)}
				{@const amounts = lineAmounts[index]}
				{@const position = index + 1}
				<li
					class="grid grid-cols-2 gap-3 px-5 py-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_6.5rem_5.5rem_7rem_8rem_2.25rem] md:items-start md:py-3"
				>
					<div class="col-span-2 md:col-span-1">
						<label for="line-{line.key}-product" class="field-label md:sr-only">
							Producto (línea {position})
						</label>
						<div class="mt-1.5 md:mt-0">
							<Combobox
								id="line-{line.key}-product"
								name="lines.productId"
								bind:selected={line.product}
								search={searchProducts}
								optionLabel={(product) => `${product.name} · ${product.sku}`}
								optionContent={productOption}
								placeholder="Buscar por nombre o SKU"
								invalid={Boolean(lineError(index, 'productId'))}
								describedBy={lineError(index, 'productId')
									? errorId(line.key, 'productId')
									: undefined}
							/>
						</div>
						<FieldError
							id={errorId(line.key, 'productId')}
							messages={lineError(index, 'productId')}
						/>
					</div>

					<div>
						<label for="line-{line.key}-quantity" class="field-label md:sr-only">
							Cantidad (línea {position})
						</label>
						<input
							id="line-{line.key}-quantity"
							name="lines.quantity"
							inputmode="decimal"
							required
							bind:value={line.quantity}
							aria-invalid={lineError(index, 'quantity') ? 'true' : undefined}
							aria-describedby={lineError(index, 'quantity')
								? errorId(line.key, 'quantity')
								: undefined}
							class="field-input mt-1.5 text-right tabular-nums md:mt-0"
						/>
						<FieldError
							id={errorId(line.key, 'quantity')}
							messages={lineError(index, 'quantity')}
						/>
					</div>

					<div>
						<label for="line-{line.key}-discount" class="field-label md:sr-only">
							Descuento % (línea {position})
						</label>
						<input
							id="line-{line.key}-discount"
							name="lines.discountPercent"
							inputmode="decimal"
							placeholder="0"
							bind:value={line.discountPercent}
							aria-invalid={lineError(index, 'discountPercent') ? 'true' : undefined}
							aria-describedby={lineError(index, 'discountPercent')
								? errorId(line.key, 'discountPercent')
								: undefined}
							class="field-input mt-1.5 text-right tabular-nums md:mt-0"
						/>
						<FieldError
							id={errorId(line.key, 'discountPercent')}
							messages={lineError(index, 'discountPercent')}
						/>
					</div>

					<div class="text-sm md:pt-2 md:text-right">
						<span class="text-caption md:hidden">Precio unit. </span>
						<span class="tabular-nums">
							{line.product ? formatAmount(line.product.listPrice) : '—'}
						</span>
						{#if line.product}
							<span class="block text-xs text-label-secondary">
								+ {formatPercent(line.product.taxRatePercent)} imp.
							</span>
						{/if}
					</div>

					<div class="text-sm font-medium md:pt-2 md:text-right">
						<span class="text-caption font-normal md:hidden">Subtotal </span>
						<span class="tabular-nums">{amounts ? money(amounts.subtotalCents) : '—'}</span>
					</div>

					<div class="col-span-2 flex justify-end md:col-span-1">
						<button
							type="button"
							class="btn-icon hover:text-danger"
							aria-label="Quitar línea {position}"
							title="Quitar línea"
							onclick={() => removeLine(line.key)}
						>
							<Icon name="trash" size={17} />
						</button>
					</div>
				</li>
			{/each}
		</ol>

		<div class="border-t border-separator px-3 py-2 sm:px-4">
			<button
				type="button"
				class="btn-plain"
				bind:this={addLineButton}
				disabled={draft.lines.length >= MAX_ORDER_LINES}
				onclick={addLine}
			>
				<Icon name="plus" size={16} />
				Añadir producto
			</button>
			<FieldError id="lines-error" messages={fieldErrors.lines} />
		</div>
	</section>

	<div class="grid gap-6 md:grid-cols-[minmax(0,1fr)_20rem]">
		<div>
			<label for="notes" class="field-label">
				Notas <span class="font-normal text-label-secondary">(opcional)</span>
			</label>
			<textarea
				id="notes"
				name="notes"
				rows="4"
				maxlength={MAX_NOTES_LENGTH}
				placeholder="Condiciones, plazos de entrega, forma de pago…"
				bind:value={draft.notes}
				aria-invalid={fieldErrors.notes ? 'true' : undefined}
				aria-describedby={fieldErrors.notes ? 'notes-error' : undefined}
				class="field-input mt-1.5"></textarea>
			<FieldError id="notes-error" messages={fieldErrors.notes} />
		</div>

		<section class="panel self-start p-5" aria-label="Totales estimados">
			<dl class="space-y-2 text-sm">
				<div class="flex justify-between gap-4">
					<dt class="text-label-secondary">Subtotal</dt>
					<dd class="tabular-nums">{money(totals.subtotalCents)}</dd>
				</div>
				<div class="flex justify-between gap-4">
					<dt class="text-label-secondary">Impuestos</dt>
					<dd class="tabular-nums">{money(totals.taxCents)}</dd>
				</div>
				<div
					class="flex justify-between gap-4 border-t border-separator pt-2 text-base font-semibold"
				>
					<dt>Total</dt>
					<dd class="tabular-nums">{money(totals.totalCents)}</dd>
				</div>
			</dl>
			<p class="mt-3 text-xs text-label-secondary">
				{hasIncompleteLines
					? 'Las líneas incompletas no se incluyen en el total.'
					: 'Estimado. Al guardar se aplican el precio y el impuesto vigentes del catálogo.'}
			</p>
		</section>
	</div>

	<div
		class="flex flex-col-reverse gap-2 border-t border-separator pt-5 sm:flex-row sm:justify-end"
	>
		<a href={cancelHref} class="btn-secondary">Cancelar</a>
		<button type="submit" class="btn-primary" disabled={submitting}>
			{submitting ? 'Guardando…' : submitLabel}
		</button>
	</div>
</form>
