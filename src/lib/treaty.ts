import { treaty as t } from '@elysiajs/eden';
import type { App } from '$lib/convex/http';
import { browser } from '$app/environment';

export const treaty = browser ? t<App>(new URL(document.URL).origin).api : undefined!;
