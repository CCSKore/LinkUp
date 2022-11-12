/*
 * Copyright (c) 2020-2022 Cynthia K. Rey, All rights reserved.
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

import type { QueryElement } from '../utils/proxy'
import { messageCircle } from '../icons/feather'

import { formatPronouns } from '@pronoundb/shared/format.js'
import { fetchPronouns } from '../utils/fetch'
import { fetchVueProp } from '../utils/proxy'
import { h, css } from '../utils/dom'

export const match = /^https:\/\/modrinth\.com/

async function fetchUntilData (el: HTMLElement, query: QueryElement[]) {
  for (let i = 1; i < 20; i++) {
    const data = await fetchVueProp(el, query)
    if (data !== void 0) return data

    await new Promise((r) => setTimeout(r, i * 25))
  }

  return null
}

async function processProfileInfo (stats: HTMLElement) {
  const layout = document.getElementById('main') as HTMLElement
  let githubId = await fetchVueProp(layout, [ '$children', '0', 'user', 'github_id' ])
  if (!githubId) githubId = await fetchVueProp(layout, [ '$parent', '$children', '0', 'user', 'github_id' ])

  const pronouns = await fetchPronouns('github', githubId.toString())
  if (pronouns === 'unspecified') return

  const pronounsInfo = stats.firstChild!.cloneNode() as HTMLElement
  const icon = messageCircle({ class: 'secondary-stat__icon' })
  const span = h('span', { class: 'secondary-stat__text' }, formatPronouns(pronouns))

  const vData = Object.keys(pronounsInfo.dataset).find((d) => d.startsWith('v-'))!
  icon.dataset[vData] = ''
  span.dataset[vData] = ''
  pronounsInfo.appendChild(icon)
  pronounsInfo.appendChild(span)

  stats.prepend(pronounsInfo)
}

async function processTeamMembers () {
  const layout = document.getElementById('main') as HTMLElement
  const members = await fetchUntilData(layout, [ '$data', 'members' ])

  for (const member of members) {
    const pronouns = await fetchPronouns('github', member.user.github_id.toString())
    if (pronouns === 'unspecified') continue

    const linkEl = document.querySelector(`.team-member .member-info a[href='/user/${member.name}']`)
    if (!linkEl) continue

    const newLink = linkEl.cloneNode(true)
    const p = newLink.firstChild as HTMLElement
    p.style.margin = '0'

    linkEl.parentElement?.replaceChild(
      h(
        'div',
        { style: css({ display: 'flex', alignItems: 'center', gap: '4px', margin: '0.2rem 0' }) },
        newLink,
        h(
          'span',
          { style: css({ fontSize: 'var(--font-size-xs)' }) },
          `(${formatPronouns(pronouns)})`
        )
      ),
      linkEl
    )
  }
}

// Modrinth doesn't expose GH ID here. :shrug:
// async function processProjectItems () {
//   const layout = document.getElementById('main') as HTMLElement
//   console.log('project items')
//   const items = await fetchUntilData(layout, [ '$data', 'results' ])
//
//   for (const item of items) {
//     console.log(item)
//   }
// }

function processPage () {
  if (document.querySelector('.extra-info .team-member')) {
    processTeamMembers()
  }

  const profileSidebar = document.querySelector<HTMLElement>('aside.card.sidebar')
  const stats = profileSidebar?.querySelector<HTMLElement>('.stats-block')
  if (stats) {
    processProfileInfo(stats)
  }
}

function handleMutation (nodes: MutationRecord[]) {
  // let itemsSeen = false
  for (const { addedNodes } of nodes) {
    for (const added of addedNodes) {
      if (added instanceof HTMLElement) {
        // if (!itemsSeen && added.classList.contains('project-card')) {
        //   itemsSeen = true
        //   processProjectItems()
        // }

        if (added.id === 'main') {
          processPage()
        }
      }
    }
  }
}

export function inject () {
  // Process loaded page
  processPage()

  // Start observer
  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })
}
