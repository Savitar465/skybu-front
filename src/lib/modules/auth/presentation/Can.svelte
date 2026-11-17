<!--
	Muestra su contenido solo si el usuario cumple el requisito de permisos.

	<Can requirement={Permissions.iam.rolesManage}>
		<button>Nuevo rol</button>
		{#snippet fallback()}<p>Solo lectura</p>{/snippet}
	</Can>
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PermissionRequirement } from '../domain/principal';
	import { can } from './authorization';

	interface Props {
		requirement: PermissionRequirement;
		children: Snippet;
		fallback?: Snippet;
	}

	let { requirement, children, fallback }: Props = $props();

	const allowed = $derived(can(requirement));
</script>

{#if allowed}
	{@render children()}
{:else if fallback}
	{@render fallback()}
{/if}
