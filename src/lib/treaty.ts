import { treaty as t } from '@elysiajs/eden';
import type { App } from '$lib/convex/http';

export const treaty = t<App>('http://localhost:5173').api;
