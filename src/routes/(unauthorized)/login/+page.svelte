<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card/';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { treaty } from '$lib/treaty';
	const { data } = $props();
	let isRegister = $state(false);

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let username = $state('');
	async function handle() {
		let status = 0;

		const handleRegister = async () => {
			if (password !== confirmPassword) {
				alert('Passwords do not match');
				return 400;
			}
			const res = await treaty.auth.register.post({ email, password, username });
			return res.status;
		};

		const handleLogin = async () => {
			const res = await treaty.auth.login.post({ email, password });
			return res.status;
		};

		status = isRegister ? await handleRegister() : await handleLogin();

		await invalidateAll();

		if (status >= 200 && status < 300) {
			goto('/');
		} else {
			alert('Invalid email or password');
		}
	}
</script>

<Card.Root class="w-full max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">{isRegister ? 'Register' : 'Login'}</Card.Title>
		<Card.Description>
			{isRegister
				? 'Create an account by entering your details below.'
				: 'Enter your email below to login to your account.'}
		</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-4">
		<div class="grid gap-2">
			<Label for="email">Email</Label>
			<Input bind:value={email} id="email" type="email" placeholder="m@example.com" required />
		</div>
		<div class="grid gap-2">
			<Label for="password">Password</Label>
			<Input bind:value={password} id="password" type="password" required />
		</div>
		{#if isRegister}
			<div class="grid gap-2">
				<Label for="confirmPassword">Confirm Password</Label>
				<Input bind:value={confirmPassword} id="confirmPassword" type="password" required />
			</div>
			<div class="grid gap-2">
				<Label for="username">Username</Label>
				<Input
					bind:value={username}
					id="username"
					type="text"
					placeholder="Your username"
					required
				/>
			</div>
		{/if}
	</Card.Content>
	<Card.Footer class="grid gap-2">
		<Button onclick={handle} class="w-full">{isRegister ? 'Register' : 'Sign in'}</Button>
		<Button
			onclick={() => {
				isRegister = !isRegister;
			}}
			class="w-full"
			variant="link"
		>
			{isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
		</Button>
	</Card.Footer>
</Card.Root>
