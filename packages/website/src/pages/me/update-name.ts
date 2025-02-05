/*
 * Copyright (c) Cynthia Rey et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import type { APIContext } from 'astro'
import { authenticate, validateCsrf } from '@server/auth.js'
import { updateName, deleteName } from '@server/database/account.js'
import { setFlash } from '@server/flash.js'

export async function POST (ctx: APIContext) {
	const user = await authenticate(ctx)
	if (!user) return new Response('401: Unauthorized', { status: 401 })

	const body = await ctx.request.formData().catch(() => null)
	const csrfToken = body?.get('csrfToken')
	let name = body?.get('name')

	if (typeof csrfToken !== 'string' || !validateCsrf(ctx, csrfToken)) {
		setFlash(ctx, 'E_CSRF')
		return ctx.redirect('/me')
	}

	if (typeof name !== 'string') {
		return new Response('400: Bad request', { status: 400 })
	}

	name = name.trim()

	if (name.length > 16) {
		setFlash(ctx, 'E_NAME_TOO_LONG')
		return ctx.redirect('/me')
	}

	await (name.length ? updateName(user._id, name) : deleteName(user._id))
	setFlash(ctx, 'S_NAME_UPDATED')
	return ctx.redirect('/me')
}

export function ALL () {
	return new Response('405: Method not allowed', { status: 405 })
}
