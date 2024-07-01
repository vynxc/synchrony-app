import { defineEnt, defineEntSchema, getEntDefinitions } from 'convex-ents';
import { v } from 'convex/values';

// maybe have a profile table for public information
const users = defineEnt({
	id: v.string(),
	avatar: v.string(),
	email: v.string(),
	username: v.string(),
	password_hash: v.string()
})
	.index('byId', ['id'])
	.index('byUsername', ['username'])
	.index('byEmail', ['email'])
	.edges('chats')
	.edges('messages', { ref: true });

const friends = defineEnt({
	status: v.union(v.literal('pending'), v.literal('accepted')),
	sender: v.id('users'),
	receiver: v.id('users')
})
	.index('byStatus', ['status'])
	.index('bySender', ['sender'])
	.index('byReceiver', ['receiver']);
const chats = defineEnt({
	title: v.optional(v.string())
})
	.edges('users')
	.edges('messages', { ref: true });

const messages = defineEnt({
	content: v.string()
})
	.edge('chat')
	.edge('user');

const sessions = defineEnt({
	id: v.string(),
	user_id: v.string(),
	expires_at: v.float64()
})
	.index('byId', ['id'])
	.index('byUserId', ['user_id']);

const schema = defineEntSchema({
	users,
	friends,
	chats,
	messages,
	sessions
});

export default schema;
export const entDefinitions = getEntDefinitions(schema);
