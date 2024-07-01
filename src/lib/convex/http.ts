import { convex, Elysia, HttpRouterWithElysia } from 'elysia-convex';
import { ActionCtx } from './_generated/server';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { users } from './api/auth';
import { friends } from './api/friends';
import { chats } from './api/chats';
import { Response } from './types/response';
import { messages } from './api/messages';

export const elysia = new Elysia({ prefix: '/api' })
	.onError(({ code, error }) => {
		if (code === 'INTERNAL_SERVER_ERROR' || !code)
			return Response.toFetchResponse(Response.error('Internal Server Error'));
	})
	.use(swagger())
	.use(cors())
	.use(convex<ActionCtx>())
	.use(users)
	.use(friends)
	.use(chats)
	.use(messages);

export default new HttpRouterWithElysia(elysia);
export type App = typeof elysia;
