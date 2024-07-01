import { ConvexError, v } from 'convex/values';
import { internalMutationWithAuth, mutationWithAuth, queryWithAuth } from '../auth/withAuth';
import { removeFieldsFromArray, userFieldsToRemove, checkAuth } from '../utils';
import { Response as Response } from '../types/response';
import { chats } from '../api/chats';

export const create = internalMutationWithAuth({
	args: {
		title: v.string(),
		friend: v.id('users')
	},
	handler: async (ctx, args) => {
		const authResponse = checkAuth(ctx);
		if (authResponse) return authResponse;

		const user = ctx.userSessionContext!.user!;
		const me = await ctx.table('users').getX('byId', user.id);
		const friend = await ctx.table('users').getX(args.friend);

		if (me._id === friend._id) {
			return Response.failure('You cannot create a chat with yourself');
		}

		const isFriend = await ctx
			.table('friends')
			.filter((q) =>
				q.and(
					q.or(q.eq(q.field('receiver'), friend._id), q.eq(q.field('sender'), friend._id)),
					q.or(q.eq(q.field('receiver'), me._id), q.eq(q.field('sender'), me._id)),
					q.eq(q.field('status'), 'accepted')
				)
			)
			.unique();

		if (!isFriend) {
			return Response.failure('You are not friends with this user');
		}

		const chatPromises = (await me.edge('chats')).map((x) => x.edge('users'));
		const chats = await Promise.all(chatPromises);
		for (const users of chats) {
			const length = users.length;
			if (
				length === 2 &&
				((users[0]._id === me._id && users[1]._id === friend._id) ||
					(users[0]._id === friend._id && users[1]._id === me._id))
			) {
				return Response.failure('You already have a chat with this user');
			}
		}
		await ctx.table('chats').insert({
			title: args.title,
			users: [me._id, friend._id],
			messages: []
		});

		return Response.success('Chat created');
	}
});

export const get = queryWithAuth({
	args: {
		id: v.id('chats')
	},
	handler: async (ctx, args) => {
		const user = ctx.userSessionContext?.user;
		if (!user) {
			throw new ConvexError('You are not logged in');
		}
		const chat = await ctx.table('chats').getX(args.id);
		const users = await chat.edge('users');
		const foundMe = users.findIndex((x) => x.id === user.id);

		if (foundMe === -1) {
			throw new ConvexError('You are not a member of this chat');
		}

		const richChat = {
			...chat,
			users: removeFieldsFromArray(users, ...userFieldsToRemove)
		};
		return richChat;
	}
});

export const getOrCreateChatWithFriend = internalMutationWithAuth({
	args: {
		friend: v.id('users')
	},
	handler: async (ctx, args) => {
		const authResponse = checkAuth(ctx);
		if (authResponse) return authResponse;
		const user = ctx.userSessionContext!.user!;
		const me = await ctx.table('users').getX('byId', user.id);
		const friend = await ctx.table('users').getX(args.friend);

		if (me._id === friend._id) {
			return Response.failure('You cannot create a chat with yourself');
		}

		const isFriend = await ctx
			.table('friends')
			.filter((q) =>
				q.and(
					q.or(q.eq(q.field('receiver'), friend._id), q.eq(q.field('sender'), friend._id)),
					q.or(q.eq(q.field('receiver'), me._id), q.eq(q.field('sender'), me._id)),
					q.eq(q.field('status'), 'accepted')
				)
			)
			.unique();

		if (!isFriend) {
			throw Response.failure('You are not friends with this user');
		}
		const chats = await me.edge('chats').map(async (chat) => {
			const users = await chat.edge('users');
			return {
				...chat,
				users: users
			};
		});
		const existingChat = chats.find((x) => x.users.find((y) => y._id === friend._id));
		if (existingChat) {
			return Response.success(existingChat._id as string);
		}
		const chat = await ctx.table('chats').insert({
			users: [me._id, friend._id],
			messages: []
		});
		return Response.success(chat as string);
	}
});

export const list = queryWithAuth({
	args: {},
	handler: async (ctx, args) => {
		const user = ctx.userSessionContext?.user;
		if (!user) {
			throw new ConvexError('You are not logged in');
		}
		const me = await ctx.table('users').getX('byId', user.id);
		const chats = await me.edge('chats');

		const richChatsPromises = chats.map(async (chat) => {
			const users = await chat.edge('users');
			const lastMessage = await chat.edge('messages').order('desc').first();
			return {
				...chat,
				users: removeFieldsFromArray(users, ...userFieldsToRemove),
				lastMessage: lastMessage
			};
		});
		const richChats = await Promise.all(richChatsPromises);

		return richChats;
	}
});
