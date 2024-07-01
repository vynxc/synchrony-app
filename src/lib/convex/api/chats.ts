import { Elysia, t } from 'elysia';
import { convex } from 'elysia-convex';
import { internal } from '../_generated/api';
import { Id } from '../_generated/dataModel';
import type { ActionCtx } from '../_generated/server';
import { ApiResponse, Response } from '../types/response';
import { ensureSession } from './utils/session';

export const chats = new Elysia({ prefix: '/chats' })
	.use(ensureSession)
	.use(convex<ActionCtx>())
	.post(
		'/create',
		async (c) =>
			Response.toFetchResponse(
				await c.ctx.runMutation(internal.functions.chats.create, {
					friend: c.body.friend as Id<'users'>,
					title: c.body.title,
					sessionId: c.session(c)
				})
			),
		{
			body: t.Object({
				friend: t.String(),
				title: t.String()
			})
		}
	)
	.get(
		'/grab/:id',
		async (c) => {
			const chat: ApiResponse<string> = await c.ctx.runMutation(
				internal.functions.chats.getOrCreateChatWithFriend,
				{
					friend: c.params.id as Id<'users'>,
					sessionId: c.session(c)
				}
			);
			return Response.toElysiaResponse(chat, c);
		},
		{
			response: Response.tObject()
		}
	);
