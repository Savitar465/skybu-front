<!-- Mensajes de error de un campo, enlazados al input mediante `id` + `aria-describedby`. -->
<script lang="ts">
	interface Props {
		id: string;
		messages?: readonly string[];
	}

	let { id, messages = [] }: Props = $props();
</script>

{#if messages.length > 0}
	<ul {id} class="mt-1.5 space-y-0.5 text-sm text-danger">
		{#each messages as message (message)}
			<li>{message}</li>
		{/each}
	</ul>
{/if}
