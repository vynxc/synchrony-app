import Elysia, { t } from 'elysia';
import { convex } from 'elysia-convex';
import { api, internal } from '../_generated/api';
import { ensureSession } from './utils/session';
import { ApiResponse, Response } from '../types/response';
import { Id } from '../_generated/dataModel';

export const messages = new Elysia({ prefix: '/messages' })
	.use(ensureSession)
	.use(convex())
	.post(
		'/send',
		async (c) => {
			const mutation: ApiResponse<string> = await c.ctx.runMutation(
				internal.functions.messages.send,
				{
					chatId: c.body.chatId as Id<'chats'>,
					content: c.body.message,
					sessionId: c.session(c)
				}
			);
			return Response.toElysiaResponse(mutation, c);
		},
		{
			body: t.Object({
				chatId: t.String(),
				message: t.String()
			}),
			response: Response.tObject()
		}
	)
	.get('/list/:chatId', async (c) =>
		Response.toFetchResponse(
			(await c.ctx.runQuery(api.functions.messages.get, {
				chatId: c.params.chatId as Id<'chats'>,
				sessionId: c.session(c),
				api: true
			})) as ApiResponse<any>
		)
	);
