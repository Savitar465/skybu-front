<!-- Indicador de estado compacto. El texto transmite el estado; el color solo lo refuerza. -->
<script lang="ts" module>
	export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
</script>

<script lang="ts">
	interface Props {
		tone?: BadgeTone;
		label: string;
	}

	let { tone = 'neutral', label }: Props = $props();

	const TONE_CLASSES: Record<BadgeTone, string> = {
		neutral: 'bg-fill-strong text-label-secondary',
		accent: 'bg-accent-fill text-accent',
		success: 'bg-success-fill text-success',
		warning: 'bg-warning-fill text-warning',
		danger: 'bg-danger-fill text-danger'
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap {TONE_CLASSES[
		tone
	]}"
>
	{label}
</span>
