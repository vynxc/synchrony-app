<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '$lib/convex/_generated/api';
	import * as Avatar from '$lib/components/ui/avatar';
	import Send from 'lucide-svelte/icons/send';
	import Users from 'lucide-svelte/icons/users';
	import * as ScrollArea from '$lib/components/ui/scroll-area/index';
	import Trash from 'lucide-svelte/icons/trash';
	import { page } from '$app/stores';
	import { useSession } from '$lib/auth.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { Id } from '$lib/convex/_generated/dataModel';
	import { treaty } from '$lib/treaty';
	import { toast } from 'svelte-sonner';
	import { type ApiResponse } from '$lib/convex/types/response';
	import { auth } from '$lib/auth.svelte';
	const session = useSession()!;
	console.log(session);
	const messages = useQuery(api.functions.messages.list, {
		chatId: $page.params.id as Id<'chats'>,
		sessionId: session.value
	});
	const chat = useQuery(api.functions.chats.get, {
		id: $page.params.id as Id<'chats'>,
		sessionId: session.value
	});
	let message = $state('');
	$effect(() => {
		console.log(messages);
	});
	async function handleSendMessage() {
		const response = await treaty.messages.send.post({
			chatId: $page.params.id as Id<'chats'>,
			message
		});
		if (!response.data?.success) {
			const error = response.error?.value as ApiResponse<string>;
			error.message ? toast(error.message) : null;
		}
		message = '';
	}
	function scrollToBottom(args?: any) {
		console.log('messages');
		const scroller = document.getElementById('scroller');
		if (!scroller) return;
		const scrollDistance = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
		const threshold = 100;

		scroller.scroll({
			top: scroller.scrollHeight,
			behavior: scrollDistance > threshold ? 'auto' : 'smooth'
		});
	}
	$effect(() => {
		scrollToBottom(messages.data);
	});
</script>

<div class="flex h-full w-full flex-col justify-between gap-2 p-2">
	<div class="flex h-14 items-center justify-between rounded-lg border p-2">
		{#if chat.data}
			{@const notMe = chat.data.users.find((x) => x.id !== auth.user!.id)}

			<div class="flex items-center gap-2">
				<Avatar.Root>
					<Avatar.Image src={notMe!.avatar} alt="@shadcn" />
					<Avatar.Fallback><Users /></Avatar.Fallback>
				</Avatar.Root>
				<div>
					<h1 class="text-smfont-bold">
						{#if chat.data.users.length === 2}
							{chat.data.title ?? notMe!.username}
						{:else}
							{chat.data.title ?? chat.data.users.map((x) => x.username).join(', ')}
						{/if}
					</h1>
				</div>
			</div>
		{/if}
	</div>
	<ScrollArea.Root
		viewportId="scroller"
		orientation="vertical"
		class="flex h-auto w-full flex-col gap-8 "
	>
		{#if messages.data}
			{#each messages.data as message}
				<div
					class="  group relative mt-4 flex w-full border-collapse items-center justify-between rounded-lg border border-transparent bg-card p-2 px-3 text-card-foreground shadow-sm hover:border-accent"
				>
					<div class="flex items-center gap-2">
						<Avatar.Root>
							<Avatar.Image src={message.sender.avatar} alt="@shadcn" />
							<Avatar.Fallback>{message.sender.username}</Avatar.Fallback>
						</Avatar.Root>
						<div>
							<h1 class="text-sm font-bold">{message.sender.username}</h1>
							<div class="text-sm text-muted-foreground">
								{message.content}
							</div>
						</div>
					</div>
					<button
						class="absolute right-3 top-[-12px] hidden h-4 p-0 text-red-500 hover:text-red-700 group-hover:block"
					>
						<Trash class="h-4 w-4" />
					</button>
				</div>
			{/each}
			{scrollToBottom()}
		{/if}
	</ScrollArea.Root>
	<div class="flex w-full items-center justify-between gap-2">
		<Input
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					handleSendMessage();
				}
			}}
			bind:value={message}
			class="h-10"
			placeholder="Send a message"
		/>
		<Button onclick={handleSendMessage} class="h-9">
			<Send />
		</Button>
	</div>
</div>
