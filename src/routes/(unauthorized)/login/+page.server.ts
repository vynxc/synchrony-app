import type { PageServerLoad } from './$types';
export const load: PageServerLoad = async ({ request }) => {
	const referer = request.headers.get('referer');
	console.log(referer);

	return {
		props: {
			referer
		}
	};
};
