<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import Friend from 'lucide-svelte/icons/user';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Plus, Search } from 'lucide-svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { useConvexClient, useQuery } from 'convex-svelte';
	import { treaty } from '$lib/treaty';
	import * as ScrollArea from '$lib/components/ui/scroll-area/index';
	import type { ApiResponse } from '$lib/convex/types/response';
	import { toast } from 'svelte-sonner';
	import { api } from '$lib/convex/_generated/api';
	import { useSession } from '$lib/auth.svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import Message from 'lucide-svelte/icons/message-circle-code';
	import type { Id } from '$lib/convex/_generated/dataModel';

	const friends = useQuery(api.functions.friends.get, {
		acceptedOnly: false,
		sessionId: useSession().value!
	});
	let username = $state('');

	async function handleAddFriend() {
		const response = await treaty.friends.add({ username }).post();
		const error = response.error?.value as ApiResponse<any>;
		if (response.data?.success) {
			username = '';
			toast(response.data?.message ?? 'Friend added');
		} else {
			toast(error.message ?? 'Failed to add friend');
		}
	}
	async function handleAccept(id: Id<'friends'>) {
		const response = await treaty.friends.accept({ id: id }).post();
		const error = response.error?.value as ApiResponse<any>;
		if (response.data?.success) {
			toast(response.data?.message ?? 'Friend request accepted');
		} else {
			toast(error.message ?? 'Failed to accept friend request');
		}
	}
	async function handleReject(id: Id<'friends'>) {
		const response = await treaty.friends.remove({ id: id }).delete();
		const error = response.error?.value as ApiResponse<any>;
		if (response.data?.success) {
			toast(response.data?.message ?? 'Friend request rejected');
		} else {
			toast(error.message ?? 'Failed to reject friend request');
		}
	}

	async function handleSendMessage(id: Id<'users'>) {
		const response = await treaty.chats.grab({ id: id }).get();
		const error = response.error?.value as ApiResponse<any>;
		if (response.data?.success) {
			toast(response.data?.message ?? 'Got chat');
		} else {
			toast(error.message ?? 'Failed to send message');
		}
	}
</script>

<div class="flex h-full w-full flex-col justify-between gap-2">
	<div class="flex items-center gap-5 rounded-lg p-2">
		<div class="flex items-center gap-2">
			<Friend />
			<p class="rounded-lg font-bold text-white">Friends</p>
		</div>
		<Separator orientation="vertical" />

		<Badge class="rounded-sm">All</Badge>
		<Badge class="rounded-sm">Accepted</Badge>
		<Badge class="rounded-sm">Pending</Badge>
		<Badge class="rounded-sm bg-green-500 text-white">Add Friend</Badge>
	</div>
	<Separator />
	<div class="flex h-full w-full flex-col gap-8">
		<div class="flex w-full items-center justify-between gap-2">
			<Input
				onkeydown={(e) => {
					if (e.key === 'Enter') {
						handleAddFriend();
					}
				}}
				class="h-10"
				bind:value={username}
				placeholder="Search friends"
			/>
			<Button onclick={handleAddFriend} variant="outline">
				<Search />
			</Button>
		</div>
		<ScrollArea.Root>
			{#if friends.data}
				{@const accepted = friends.data.filter((x) => x.status === 'accepted')}
				{#if accepted.length > 0}
					<p class="text-sm text-muted-foreground">
						{accepted.length} friends found
					</p>
				{/if}
				{#each accepted as friend}
					<div
						class="mt-2 flex items-center justify-between rounded-lg border bg-card p-3 text-card-foreground shadow-sm"
					>
						<div class="flex items-center gap-2">
							<Avatar.Root>
								<Avatar.Image src={friend.user.avatar} />
								<Avatar.Fallback>{friend.user.username[0]}</Avatar.Fallback>
							</Avatar.Root>
							<div>
								<h1 class="text-sm font-bold">{friend.user.username}</h1>
							</div>
						</div>
						<button onclick={() => handleSendMessage(friend.user._id)}>
							<Message />
						</button>
					</div>
				{/each}
				{@const pending = friends.data.filter((x) => x.status === 'pending')}
				{#if pending.length > 0}
					<p class="text-sm text-muted-foreground">
						{pending.length} pending requests
					</p>
				{/if}
				{#each pending as friend}
					<div
						class="mt-2 flex items-center justify-between rounded-lg border bg-card p-3 text-card-foreground shadow-sm"
					>
						<div class="flex items-center gap-2">
							<Avatar.Root>
								<Avatar.Image src={friend.user.avatar} />
								<Avatar.Fallback>{friend.user.username[0]}</Avatar.Fallback>
							</Avatar.Root>
							<div>
								<h1 class="text-sm font-bold">{friend.user.username}</h1>
							</div>
						</div>
						<div>
							{#if !friend.isSelf}
								<Button
									onclick={() => {
										handleReject(friend._id);
									}}
									variant="destructive">Reject</Button
								>
								<Button
									onclick={() => {
										handleAccept(friend._id);
									}}
									variant="secondary">Accept</Button
								>
							{:else}
								<Button
									onclick={() => {
										handleReject(friend._id);
									}}
									variant="secondary">Unsend</Button
								>
							{/if}
						</div>
					</div>
				{/each}
			{/if}
		</ScrollArea.Root>
	</div>
</div>
