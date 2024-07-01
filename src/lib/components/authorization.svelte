<script lang="ts">
	import { goto } from '$app/navigation';
	import { auth } from '$lib/auth.svelte';
	import type { Auth } from '$lib/types/user';
	import type { Snippet } from 'svelte';

	let {
		unauthorized,
		authorized,
		redirectUrl
	}: { unauthorized?: Snippet; authorized?: Snippet<[Auth]>; redirectUrl?: string } = $props();
	$effect(() => {
		if (redirectUrl && !auth.user && !auth.loading) {
			goto(redirectUrl);
		}
	});
</script>

{#if auth.user}
	{#if authorized}
		{@render authorized(auth)}
	{/if}
{:else if unauthorized}
	{@render unauthorized()}
{/if}
