<script>
	import { invalidateAll } from '$app/navigation';
	import Authorization from '$lib/components/authorization.svelte';
	import { treaty } from '$lib/treaty';
</script>

<Authorization redirectUrl="/login">
	{#snippet authorized(auth)}
		<p>Hello {auth.user?.username}!</p>

		<button
			onclick={async () => {
				await treaty.auth.logout.get();
				auth.session = undefined;
				auth.user = undefined;
			}}>Logout</button
		>
	{/snippet}
	{#snippet unauthorized()}
		<p>You are not authorized</p>
	{/snippet}
</Authorization>
