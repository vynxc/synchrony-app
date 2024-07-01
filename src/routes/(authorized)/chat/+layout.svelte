<script lang="ts">
	import { useQuery } from 'convex-svelte';
	import { api } from '../../../lib/convex/_generated/api';
	import * as Avatar from '$lib/components/ui/avatar';
	import Message from 'lucide-svelte/icons/message-circle-code';
	import Users from 'lucide-svelte/icons/users';
	import * as ScrollArea from '$lib/components/ui/scroll-area/index';
	import { useSession } from '$lib/auth.svelte';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Separator } from '$lib/components/ui/separator';
	import Icon from 'lucide-svelte/icons/chef-hat';
	import Settings from 'lucide-svelte/icons/settings';
	import Search from 'lucide-svelte/icons/search';
	import { Input } from '$lib/components/ui/input';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	let { children } = $props();
	const session = useSession()!;
	if (!session.value) throw new Error('session is not defined');

	let chats = useQuery(api.functions.chats.list, {
		sessionId: session.value
	});
</script>

<Resizable.PaneGroup
	direction="horizontal"
	class="m-2 flex h-full w-full gap-2 rounded-lg border p-2"
>
	<Resizable.Pane defaultSize={20}>
		<div class="flex w-full flex-col gap-2 rounded-lg p-2">
			<div class="flex items-center justify-between gap-2 rounded-lg p-2">
				<div class="flex items-center gap-1">
					<Icon />
					<p class="rounded-lg font-bold text-white">Synchrony</p>
				</div>
				<div class="flex items-center gap-2">
					<Settings />
					<Search />
				</div>
			</div>
			<Separator />
			<div class="flex flex-col gap-2">
				<p class="py-2 text-lg font-bold">Chats</p>
				<ScrollArea.Root>
					{#if chats.data}
						{#each chats.data as chat}
							<div
								class="flex items-center justify-between rounded-lg bg-card text-card-foreground shadow-sm"
							>
								<div class="flex items-center gap-2">
									<Avatar.Root>
										<Avatar.Fallback><Users /></Avatar.Fallback>
									</Avatar.Root>
									<div>
										<h1 class="text-sm font-bold">{chat.title}</h1>
										{#if chat.lastMessage}
											<div class="text-sm text-muted-foreground">
												{chat.lastMessage.content}
											</div>
										{/if}
									</div>
								</div>
								<button>
									<Message />
								</button>
							</div>
						{/each}
					{/if}
				</ScrollArea.Root>
			</div>
		</div>
	</Resizable.Pane>
	<Resizable.Handle />
	<Resizable.Pane defaultSize={80}>
		<div class="h-full w-full p-2">
			{@render children()}
		</div>
		<Resizable.Handle />
	</Resizable.Pane>
</Resizable.PaneGroup>
