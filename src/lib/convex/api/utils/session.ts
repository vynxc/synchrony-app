import Elysia, { Context, RouteSchema, SingletonBase } from 'elysia';
import { Response } from '../../types/response';
export const ensureSession = new Elysia()
	.onBeforeHandle({ as: 'scoped' }, (c) => {
		const session = c.cookie['auth_session'];
		if (!session.value || typeof session.value !== 'string') {
			console.log('session', session);
			return Response.toFetchResponse(Response.unauthorized('You are not logged in'));
		}
	})
	.decorate('session', (c: Context<RouteSchema, SingletonBase, any>) => {
		const session = c.cookie['auth_session'];
		console.log('session', session.value);

		if (!session.value || typeof session.value !== 'string') {
			throw new Error('Fatal Error, before handle should have caught this');
		}
		return session.value;
	});
