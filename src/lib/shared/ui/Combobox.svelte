<!--
	Selector con búsqueda remota (patrón «combobox» de WAI-ARIA 1.2, lista con autocompletado).

	- Teclado: ↓/↑ recorren las opciones, Intro elige, Esc cierra y restaura el valor.
	- El valor elegido viaja en un `<input type="hidden" name={name}>`, así que el componente se
	  usa dentro de un formulario normal. Si se escribe y no se elige nada, se restaura la
	  selección anterior: nunca queda un texto que no corresponde a ninguna opción.
	- Las búsquedas se agrupan (debounce) y se descartan las respuestas que llegan fuera de orden.
-->
<script lang="ts" generics="Option extends { readonly id: string }">
	import { onDestroy, type Snippet } from 'svelte';
	import { SearchFailedError } from './search-failed-error';

	interface Props {
		id: string;
		name: string;
		selected: Option | null;
		search: (term: string) => Promise<readonly Option[]>;
		/** Texto que se muestra en el campo para una opción elegida. */
		optionLabel: (option: Option) => string;
		/** Contenido de cada fila de la lista; por defecto, `optionLabel`. */
		optionContent?: Snippet<[Option]>;
		onselect?: (option: Option) => void;
		placeholder?: string;
		invalid?: boolean;
		describedBy?: string;
		ariaLabel?: string;
	}

	let {
		id,
		name,
		selected = $bindable(),
		search,
		optionLabel,
		optionContent,
		onselect,
		placeholder = 'Buscar…',
		invalid = false,
		describedBy,
		ariaLabel
	}: Props = $props();

	const DEBOUNCE_MS = 200;
	const listboxId = $derived(`${id}-listbox`);

	/**
	 * Texto del campo: refleja la opción elegida y se sobrescribe mientras se escribe (derivado
	 * escribible). Al cambiar la selección vuelve a mostrar su etiqueta.
	 */
	let query = $derived(selected ? optionLabel(selected) : '');
	let options: readonly Option[] = $state([]);
	let open = $state(false);
	let activeIndex = $state(-1);
	let status: 'idle' | 'loading' | 'error' = $state('idle');
	let latestRequest = 0;
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	const activeOptionId = $derived(
		open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
	);

	onDestroy(() => clearTimeout(debounceTimer));

	function scheduleSearch(term: string) {
		clearTimeout(debounceTimer);
		status = 'loading';
		debounceTimer = setTimeout(() => runSearch(term), DEBOUNCE_MS);
	}

	async function runSearch(term: string) {
		const request = ++latestRequest;
		try {
			const results = await search(term.trim());
			if (request !== latestRequest) return;
			options = results;
			activeIndex = results.length > 0 ? 0 : -1;
			status = 'idle';
		} catch (error) {
			if (!(error instanceof SearchFailedError)) throw error;
			if (request !== latestRequest) return;
			// El fallo se muestra en la lista; el detalle ya quedó registrado en el servidor.
			options = [];
			status = 'error';
		}
	}

	function openList() {
		if (open) return;
		open = true;
		scheduleSearch(selected && query === optionLabel(selected) ? '' : query);
	}

	function close(restore: boolean) {
		open = false;
		activeIndex = -1;
		clearTimeout(debounceTimer);
		if (restore) {
			query = selected ? optionLabel(selected) : '';
		}
	}

	function choose(option: Option) {
		selected = option;
		query = optionLabel(option);
		close(false);
		onselect?.(option);
	}

	function handleInput(event: Event & { currentTarget: HTMLInputElement }) {
		query = event.currentTarget.value;
		open = true;
		scheduleSearch(query);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (!open) {
				openList();
				return;
			}
			const step = event.key === 'ArrowDown' ? 1 : -1;
			if (options.length > 0) {
				activeIndex = (activeIndex + step + options.length) % options.length;
			}
		} else if (event.key === 'Enter' && open) {
			// Intro elige la opción; no debe enviar el formulario.
			event.preventDefault();
			const option = options[activeIndex];
			if (option) choose(option);
		} else if (event.key === 'Escape' && open) {
			event.preventDefault();
			close(true);
		}
	}

	function handleFocusOut(event: FocusEvent & { currentTarget: HTMLElement }) {
		const next = event.relatedTarget;
		if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
			close(true);
		}
	}
</script>

<div class="relative" onfocusout={handleFocusOut}>
	<input
		{id}
		type="text"
		role="combobox"
		autocomplete="off"
		spellcheck="false"
		aria-autocomplete="list"
		aria-expanded={open}
		aria-controls={listboxId}
		aria-activedescendant={activeOptionId}
		aria-invalid={invalid ? 'true' : undefined}
		aria-describedby={describedBy}
		aria-label={ariaLabel}
		{placeholder}
		value={query}
		oninput={handleInput}
		onfocus={openList}
		onclick={openList}
		onkeydown={handleKeydown}
		class="field-input"
	/>
	<input type="hidden" {name} value={selected?.id ?? ''} />

	{#if open}
		<div
			class="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-control border border-separator bg-surface-raised py-1 shadow-popover"
		>
			<ul id={listboxId} role="listbox" aria-label={ariaLabel ?? 'Resultados'}>
				{#each options as option, index (option.id)}
					<!-- La lista se maneja desde el campo (aria-activedescendant); el ratón solo elige. -->
					<li
						id="{id}-option-{index}"
						role="option"
						aria-selected={index === activeIndex}
						class="cursor-pointer px-3 py-2 text-sm {index === activeIndex
							? 'bg-accent text-on-accent'
							: 'text-label'}"
						onpointerdown={(event) => event.preventDefault()}
						onclick={() => choose(option)}
						onpointermove={() => (activeIndex = index)}
						onkeydown={() => undefined}
					>
						{#if optionContent}
							{@render optionContent(option)}
						{:else}
							{optionLabel(option)}
						{/if}
					</li>
				{/each}
			</ul>
			{#if status === 'loading' && options.length === 0}
				<p class="px-3 py-2 text-sm text-label-secondary">Buscando…</p>
			{:else if status === 'error'}
				<p class="px-3 py-2 text-sm text-danger">No se pudo buscar. Inténtalo de nuevo.</p>
			{:else if options.length === 0}
				<p class="px-3 py-2 text-sm text-label-secondary">Sin resultados.</p>
			{/if}
		</div>
	{/if}
	<p class="sr-only" aria-live="polite">
		{open && status === 'idle' ? `${options.length} resultados` : ''}
	</p>
</div>
