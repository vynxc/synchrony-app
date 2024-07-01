<script>
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { setupConvex } from 'convex-svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { auth } from '$lib/auth.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	let { children, data } = $props();
	setupConvex(PUBLIC_CONVEX_URL, {
		skipConvexDeploymentUrlCheck: true,
		disabled: !browser
	});
	setAuth();
	function setAuth() {
		auth.session = data.session;
		auth.user = data.user;
		auth.loading = false;
	}
	$effect(setAuth);
</script>

<ModeWatcher />
<Toaster />
<div class="flex h-screen w-full flex-col items-center justify-center bg-background px-4">
	{@render children()}
</div>
