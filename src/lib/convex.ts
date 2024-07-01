import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { ConvexClient } from 'convex/browser';

export const client = new ConvexClient(PUBLIC_CONVEX_URL, {
	skipConvexDeploymentUrlCheck: true
});
