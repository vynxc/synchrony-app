import { Elysia } from 'elysia';
import { convex } from 'elysia-convex';
import { api, internal } from '../_generated/api';
import { Id } from '../_generated/dataModel';
import type { ActionCtx } from '../_generated/server';
import { ApiResponse, Response } from '../types/response';
import { ensureSession } from './utils/session';
export const friends = new Elysia({ prefix: '/friends' })
	.use(ensureSession)
	.use(convex<ActionCtx>())
	.post(
		'/add/:username',
		async (c) => {
			const mutation: ApiResponse = await c.ctx.runMutation(internal.functions.friends.add, {
				username: c.params.username,

				sessionId: c.session(c)
			});
			return Response.toElysiaResponse(mutation, c);
		},
		{
			response: Response.tObject()
		}
	)
	.post(
		'/accept/:id',
		async (c) => {
			const mutation: ApiResponse = await c.ctx.runMutation(internal.functions.friends.accept, {
				id: c.params.id as Id<'friends'>,
				sessionId: c.session(c)
			});
			return Response.toElysiaResponse(mutation, c);
		},
		{
			response: Response.tObject()
		}
	)
	.delete(
		'/remove/:id',
		async (c) => {
			const mutation: ApiResponse = await c.ctx.runMutation(internal.functions.friends.remove, {
				id: c.params.id as Id<'friends'>,
				sessionId: c.session(c)
			});
			return Response.toElysiaResponse(mutation, c);
		},
		{
			response: Response.tObject()
		}
	)
	.delete(
		'/removeByUser/:id',
		async (c) => {
			const mutation: ApiResponse = await c.ctx.runMutation(
				internal.functions.friends.removeByUser,
				{
					id: c.params.id as Id<'users'>,
					sessionId: c.session(c)
				}
			);
			return Response.toElysiaResponse(mutation, c);
		},
		{
			response: Response.tObject()
		}
	)
	.get(
		'/get',
		async (c) =>
			await c.ctx.runQuery(api.functions.friends.get, {
				sessionId: c.session(c)
			})
	);
