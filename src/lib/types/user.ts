export interface User {
	username: string;
	avatar: string;
	id: string;
}

export interface Auth {
	user: User | undefined;
	session: string | undefined;
	loading: boolean;
}
