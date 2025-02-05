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

import { z, defineCollection } from 'astro:content'

const atLeastOneKey = (obj: any) => !obj || Object.keys(obj).length !== 0

const decorations = defineCollection({
	type: 'data',
	schema: z.object({
		version: z.number(),
		limited: z.boolean().optional(),
		collection: z.string().optional(),
		name: z.string(),
		color: z.string().optional(),
		border: z.union([
			z.object({
				type: z.literal('solid'),
				color: z.string(),
			}),
			z.object({
				type: z.union([ z.literal('linear-gradient'), z.literal('conic-gradient') ]),
				angle: z.number().optional(),
				colors: z.array(
					z.object({
						c: z.string(),
						o: z.string(),
					})
				),
			}),
		]),
		elements: z.object({
			top_left: z.string().optional(),
			top_right: z.string().optional(),
			bottom_left: z.string().optional(),
			bottom_right: z.string().optional(),
			center: z.string().optional(),
		}).optional().refine(atLeastOneKey),
		animation: z.object({
			border: z.string().optional(),
			top_left: z.string().optional(),
			top_right: z.string().optional(),
			bottom_left: z.string().optional(),
			bottom_right: z.string().optional(),
			center: z.string().optional(),
		}).optional().refine(atLeastOneKey),
	}),
})

export const collections = {
	decorations: decorations,
}
