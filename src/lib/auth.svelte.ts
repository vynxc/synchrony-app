import type { Auth, User } from './types/user.ts';

export let auth = $state<Auth>({
	user: undefined,
	session: undefined,
	loading: true
});

export function useSession() {
	return {
		get value() {
			return auth.session!;
		}
	};
}
