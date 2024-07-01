import { Context, RouteSchema, SingletonBase, t } from 'elysia';
import { TSchema } from '@sinclair/typebox';

export interface ApiResponse<T = string> {
	success: boolean;
	message: T | undefined;
	status: number;
}

export class Response {
	static success<T = string>(message: T): ApiResponse<T> {
		return this.response(true, message, 200);
	}
	static tObject() {
		return t.Object({
			success: t.Boolean(),
			message: t.Optional(t.String()),
			status: t.Number()
		});
	}
	static failure<T = string>(message: T): ApiResponse<T> {
		return this.response(false, message, 400);
	}

	static unauthorized<T = string>(message: T): ApiResponse<T> {
		return this.response(false, message, 401);
	}

	static notFound<T = string>(message: T): ApiResponse<T> {
		return this.response(false, message, 404);
	}

	static error<T = string>(message: T): ApiResponse<T> {
		return this.response(false, message, 500);
	}

	static message<T = string>(message: T): ApiResponse<T> {
		return this.response(true, message, 200);
	}
	private static response<T = string>(
		success: boolean,
		message: T | undefined,
		status: number
	): ApiResponse<T> {
		return {
			success: success,
			message: message,
			status: status
		};
	}

	static toFetchResponse(response: ApiResponse): ResponseInit {
		return new globalThis.Response(JSON.stringify(response), {
			status: response.status,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	static toElysiaResponse(
		response: ApiResponse,
		c: Context<RouteSchema, SingletonBase, any>
	): ApiResponse {
		c.set.status = response.status;
		return response;
	}
}
