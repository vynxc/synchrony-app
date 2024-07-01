import { v, ConvexError } from 'convex/values';
import { queryWithAuth, internalMutationWithAuth } from '../auth/withAuth';
import { asyncMap } from 'convex-helpers';
import { checkAuth, removeFields, userFieldsToRemove } from '../utils';
import { Response as Response } from '../types/response';

export const add = internalMutationWithAuth({
	args: {
		username: v.string()
	},
	handler: async (ctx, args) => {
		const authResponse = checkAuth(ctx);
		if (authResponse) return authResponse;

		const user = ctx.userSessionContext!.user!;
		const me = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('id'), user.id))
			.unique();

		const friend = await ctx.table('users').get('byUsername', args.username);
		if (!me || !friend) {
			return Response.failure('User not found');
		}

		if (me.id === friend.id) {
			return Response.failure('You cannot add yourself as a friend');
		}
		const existingRequest = await ctx.db
			.query('friends')
			.filter((q) =>
				q.and(
					q.or(q.eq(q.field('receiver'), friend._id), q.eq(q.field('sender'), friend._id)),
					q.or(q.eq(q.field('receiver'), me._id), q.eq(q.field('sender'), me._id))
				)
			)
			.unique();

		if (existingRequest) {
			if (existingRequest.status === 'accepted') {
				return Response.failure('You are already friends with this user');
			}
			return Response.failure('You already have a pending request');
		}

		await ctx.db.insert('friends', {
			status: 'pending',
			sender: me._id,
			receiver: friend._id
		});

		return Response.success('Friend request sent');
	}
});

export const accept = internalMutationWithAuth({
	args: {
		id: v.id('friends')
	},
	handler: async (ctx, args) => {
		const authResponse = checkAuth(ctx);
		if (authResponse) return authResponse;

		const user = ctx.userSessionContext!.user!;
		const me = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('id'), user.id))
			.unique();
		if (!me) return Response.failure('Me is not a user');

		const friend = await ctx.db.get(args.id);
		if (!friend) {
			return Response.failure('Friend request not found');
		}
		if (friend.status !== 'pending') {
			return Response.failure('Request is not pending');
		}
		if (friend.sender !== me._id && friend.receiver !== me._id) {
			return Response.unauthorized('You are not allowed to accept this request');
		}
		if (friend.sender === me._id) {
			return Response.failure('You cannot accept your own request');
		}

		await ctx.db.patch(args.id, {
			status: 'accepted'
		});

		return Response.success('Friend request accepted');
	}
});

export const remove = internalMutationWithAuth({
	args: {
		id: v.id('friends')
	},
	handler: async (ctx, args) => {
		const authResponse = checkAuth(ctx);
		if (authResponse) return authResponse;

		const user = ctx.userSessionContext!.user!;
		const me = await ctx.table('users').get('byId', user.id);
		if (!me) return Response.failure('Me is not a user');
		const friend = await ctx.table('friends').get(args.id);
		if (!friend) {
			return Response.failure('Not found');
		}
		if (friend.sender !== me._id && friend.receiver !== me._id) {
			return Response.unauthorized('You are not allowed to accept this request');
		}

		await ctx.db.delete(args.id);

		return Response.success('Friend request removed');
	}
});
export const removeByUser = internalMutationWithAuth({
	args: {
		id: v.id('users')
	},
	handler: async (ctx, args) => {
		const authResponse = checkAuth(ctx);
		if (authResponse) return authResponse;
		const user = ctx.userSessionContext!.user!;
		const me = await ctx.table('users').get('byId', user.id);
		if (!me) return Response.failure('Me is not a user');
		const friend = await ctx.table('users').get(args.id);
		if (!friend) {
			return Response.failure('Not found');
		}
		const existingRequest = await ctx.db
			.query('friends')
			.filter((q) =>
				q.and(
					q.or(q.eq(q.field('receiver'), friend._id), q.eq(q.field('sender'), friend._id)),
					q.or(q.eq(q.field('receiver'), me._id), q.eq(q.field('sender'), me._id))
				)
			)
			.unique();
		if (!existingRequest) {
			return Response.failure('Friend request not found');
		}
		if (existingRequest.sender !== me._id && existingRequest.receiver !== me._id) {
			return Response.failure('You are not friends with this user');
		}
		await ctx.db.delete(existingRequest._id);
		return Response.success('Friend request removed');
	}
});
export const get = queryWithAuth({
	args: {
		acceptedOnly: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const user = ctx.userSessionContext?.user;
		if (!user) {
			throw new ConvexError('You are not logged in');
		}
		const me = await ctx.table('users').get('byId', user.id);

		if (!me) throw new ConvexError('Me is not a user');

		const bareFriends = await ctx
			.table('friends')
			.filter((q) =>
				args.acceptedOnly
					? q.and(
							q.or(q.eq(q.field('receiver'), me._id), q.eq(q.field('sender'), me._id)),
							q.eq(q.field('status'), 'accepted')
						)
					: q.or(q.eq(q.field('receiver'), me._id), q.eq(q.field('sender'), me._id))
			);

		const friends = await asyncMap(bareFriends, async (friend) => {
			const friendId = me._id === friend.receiver ? friend.sender : friend.receiver;
			const friendUser = await ctx.db.get(friendId);
			if (!friendUser) throw new ConvexError('Friend user not found');
			return {
				_id: friend._id,
				isSelf: friend.sender === me._id,
				status: friend.status,
				user: removeFields(friendUser, ...userFieldsToRemove)
			};
		});
		return friends.filter((x) => x !== undefined);
	}
});
