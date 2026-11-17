<!--
	Mensaje en línea tras una acción. Los errores se anuncian con `role="alert"` (interrumpen al
	lector de pantalla); éxito e información con `role="status"` (educados). El significado va
	siempre en el texto, no solo en el color.
-->
<script lang="ts">
	interface Props {
		tone?: 'info' | 'success' | 'error';
		message: string;
		class?: string;
	}

	let { tone = 'info', message, class: className = '' }: Props = $props();

	const TONE_CLASSES = {
		info: 'bg-accent-fill text-label',
		success: 'bg-success-fill text-label',
		error: 'bg-danger-fill text-danger'
	} as const;
</script>

<p
	class="rounded-control px-3.5 py-2.5 text-sm {TONE_CLASSES[tone]} {className}"
	role={tone === 'error' ? 'alert' : 'status'}
>
	{message}
</p>
