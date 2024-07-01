import { ConvexError, v } from 'convex/values';
import { internalMutationWithAuth, queryWithAuth } from '../auth/withAuth';
import { userFieldsToRemove, checkAuth, removeFields } from '../utils';
import { Response as Response } from '../types/response';

export const send = internalMutationWithAuth({
	args: {
		content: v.string(),
		chatId: v.id('chats')
	},
	handler: async (ctx, args) => {
		const authResponse = checkAuth(ctx);
		if (authResponse) return authResponse;

		const user = ctx.userSessionContext!.user!;
		const me = await ctx.table('users').getX('byId', user.id);
		const chat = await ctx.table('chats').getX(args.chatId);
		const users = await chat.edge('users');
		const foundMe = users.findIndex((x) => x.id === user.id);

		if (foundMe === -1) {
			return Response.failure('You are not a member of this chat');
		}

		await ctx.table('messages').insert({
			content: args.content,
			chatId: args.chatId,
			userId: me._id
		});

		return Response.success('Message sent');
	}
});
export const list = queryWithAuth({
	args: {
		chatId: v.id('chats')
	},
	handler: async (ctx, args) => {
		const user = ctx.userSessionContext?.user;
		if (!user) {
			throw new ConvexError('You are not logged in');
		}
		const chat = await ctx.table('chats').getX(args.chatId);
		const users = await chat.edge('users');
		const foundMe = users.findIndex((x) => x.id === user.id);
		if (foundMe === -1) {
			throw new ConvexError('You are not a member of this chat');
		}
		const messages = await chat.edge('messages').map(async (message) => {
			const sender = await message.edge('user');
			return {
				...removeFields(message, 'userId', 'chatId'),

				sender: removeFields(sender, ...userFieldsToRemove)
			};
		});

		return messages;
	}
});
export const get = queryWithAuth({
	args: {
		chatId: v.id('chats'),
		api: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const authResponse = checkAuth(ctx);
		if (authResponse) return authResponse;

		const user = ctx.userSessionContext!.user!;
		const chat = await ctx.table('chats').getX(args.chatId);
		const users = await chat.edge('users');
		const foundMe = users.findIndex((x) => x.id === user.id);
		if (foundMe === -1) {
			throw new ConvexError('You are not a member of this chat');
		}
		const messages = await chat.edge('messages').order('desc');
		const richMessagesPromise = messages.map(async (message) => {
			const sender = await message.edge('user');
			return {
				...removeFields(message, 'userId', 'chatId'),

				sender: removeFields(sender, ...userFieldsToRemove)
			};
		});
		const richMessages = await Promise.all(richMessagesPromise);

		return args.api ? Response.success(richMessages) : richMessages;
	}
});
