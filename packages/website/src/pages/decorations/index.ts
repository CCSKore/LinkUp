export const prerender = true

import type { APIContext } from 'astro'
import { getCollection } from 'astro:content'

const decorations = await getCollection('decorations')

export async function GET (ctx: APIContext) {
	const decos: string[] = []
    for (const i of decorations) {
        decos.push(i.id)
    }

	return new Response(
		JSON.stringify({
			decorations: decos
		})
	)
}

export function ALL () {
	return new Response(JSON.stringify({ statusCode: 405, error: 'Method not allowed' }), { status: 405 })
}
