import { QueryCtx } from './_generated/server';
import { Response } from './types/response';
import { QueryWithAuth } from './types/types';

export type WithoutFields<T, K extends keyof T> = Omit<T, K>;

export function removeFields<T extends object, K extends keyof T>(
	obj: T,
	...fields: K[]
): Omit<T, K> {
	const result = { ...obj };
	for (const field of fields) {
		delete result[field];
	}
	return result;
}

export function removeFieldsFromArray<T extends object, K extends keyof T>(
	arr: T[],
	...fields: K[]
): WithoutFields<T, K>[] {
	return arr.map((obj) => removeFields(obj, ...fields));
}

export const userFieldsToRemove = ['password_hash', '_creationTime'] as const;

export const checkAuth = (ctx: Parameters<QueryWithAuth<{}, any>['handler']>[0]) => {
	console.log('checkAuth', ctx);
	const user = ctx.userSessionContext?.user;
	if (!user) {
		console.log('user', user);

		return Response.unauthorized('You are not logged in');
	}
	return null;
};
