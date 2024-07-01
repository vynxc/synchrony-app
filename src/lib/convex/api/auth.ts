import type { ActionCtx } from '../_generated/server';
import { convex } from 'elysia-convex';
import { Elysia, t } from 'elysia';
import { internal } from '../_generated/api';

export const users = new Elysia({ prefix: '/auth' })
	.use(convex<ActionCtx>())
	.post(
		'/login',
		async (c) => {
			const { email, password } = c.body;
			const login = await c.ctx.runMutation(internal.functions.users.login, {
				email,
				password,
				sessionId: null
			});
			if (typeof login.message !== 'string' && login.success && login.message != undefined) {
				c.set.headers['Set-Cookie'] = login.message.cookie;
			}
			c.set.status = login.status;
			return login;
		},
		{
			body: t.Object({
				email: t.String(),
				password: t.String()
			})
		}
	)
	.post(
		'/register',
		async (c) => {
			const { username, email, password } = c.body;
			const avatar = `https://api.dicebear.com/9.x/initials/svg?seed=${username}`;
			const register = await c.ctx.runMutation(internal.functions.users.register, {
				username,
				email,
				avatar,
				password,
				sessionId: null
			});
			if (
				typeof register.message !== 'string' &&
				register.success &&
				register.message != undefined
			) {
				c.set.headers['Set-Cookie'] = register.message.cookie;
			}
			c.set.status = register.status;
			return register;
		},
		{
			body: t.Object({
				username: t.String({ minLength: 3, maxLength: 20 }),
				email: t.String({ format: 'email' }),
				password: t.String({ minLength: 8 })
			})
		}
	)
	.get('/logout', async (c) => {
		c.set.status = 204;

		c.set.headers['Set-Cookie'] =
			'auth_session=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

		return null;
	});
