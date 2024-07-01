import { v } from 'convex/values';
import { internalMutationWithAuth, queryWithAuth } from '../auth/withAuth';
import { Scrypt, generateIdFromEntropySize } from 'lucia';

import { Response } from '../types/response';
export const getSession = queryWithAuth({
	args: {},
	handler: async (ctx) => {
		return {
			session: JSON.stringify(ctx.userSessionContext),
			cookie: ctx.userSessionContext?.session?.fresh
				? ctx.auth.createSessionCookie(ctx.userSessionContext.session.id).serialize()
				: undefined
		};
	}
});

export const register = internalMutationWithAuth({
	args: {
		username: v.string(),
		email: v.string(),
		avatar: v.string(),
		password: v.string()
	},
	handler: async (ctx, args) => {
		const id = generateIdFromEntropySize(10);
		const hashedPassword = await new Scrypt().hash(args.password);

		const isExistingUser = await ctx.db
			.query('users')
			.withIndex('byEmail', (q) => q.eq('email', args.email))
			.unique();

		if (isExistingUser) {
			return Response.failure('Username already exists');
		}

		const session = await ctx.auth.createSession(id, {
			username: args.username,
			avatar: args.avatar
		});
		const cookie = ctx.auth.createSessionCookie(session.id).serialize();

		await ctx.db.insert('users', {
			id,
			username: args.username,
			avatar: args.avatar,
			email: args.email,
			password_hash: hashedPassword
		});
		return Response.success({ cookie });
	}
});

export const login = internalMutationWithAuth({
	args: {
		email: v.string(),
		password: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.withIndex('byEmail', (q) => q.eq('email', args.email))
			.unique();

		if (!user) {
			return Response.failure('User not found');
		}

		const passwordMatches = await new Scrypt().verify(user.password_hash, args.password);

		if (!passwordMatches) {
			return Response.unauthorized('Invalid password');
		}

		const session = await ctx.auth.createSession(user.id, {
			username: user.username,
			avatar: user.avatar
		});
		const cookie = ctx.auth.createSessionCookie(session.id).serialize();
		return Response.success({ cookie });
	}
});
