<!--
	Iconos de trazo (estilo SF Symbols / Lucide) dibujados inline: sin dependencias ni peticiones.
	Son decorativos (`aria-hidden`); el control que los contiene lleva siempre texto o `aria-label`.
-->
<script lang="ts" module>
	const PATHS = {
		plus: 'M12 5v14M5 12h14',
		trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3',
		search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
		chevronLeft: 'M15 18l-6-6 6-6',
		chevronRight: 'M9 18l6-6-6-6',
		chevronDown: 'M6 9l6 6 6-6',
		close: 'M18 6 6 18M6 6l12 12',
		menu: 'M4 7h16M4 12h16M4 17h16',
		pencil: 'M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4',
		box: 'M21 8 12 3 3 8v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8',
		document: 'M14 3H6v18h12V7l-4-4zM14 3v4h4M9 13h6M9 17h6',
		cart: 'M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6M9 20h.01M17 20h.01',
		tag: 'M3 12V4h8l10 10-8 8L3 12zM7.5 7.5h.01',
		shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z',
		home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4v-9z',
		logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10'
	} as const;

	export type IconName = keyof typeof PATHS;
</script>

<script lang="ts">
	interface Props {
		name: IconName;
		/** Tamaño en píxeles. */
		size?: number;
		class?: string;
	}

	let { name, size = 18, class: className = '' }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.75"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	class="shrink-0 {className}"
>
	<path d={PATHS[name]} />
</svg>
