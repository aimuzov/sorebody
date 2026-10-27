import { localizeRelease, visibleReleases, type Release } from '@aimuzov/infra-site-kit/changelog.js'
import * as lucide from 'lucide-static'

import { PADEL_RACKET } from '#frontend/lib/icons.ts'

import releases from './changelog.json' with { type: 'json' }

/**
 * Что нового на сайте, для читателя: страница /changelog. Записи лежат в changelog.json и пишутся
 * в релизный PR через site-changelog из infra-site-kit, правила тона -- в changelog.guide.md.
 * Здесь записи только получают SVG своих иконок. Сайт на одном языке, но с kit 5.3 заголовок и
 * пункты в типе бывают и по языкам: localizeRelease сводит их к строкам.
 */
const ICONS: Record<string, string> = { ...lucide, PadelRacket: PADEL_RACKET }

export const RELEASES = visibleReleases(releases as Release[]).map((r) => ({
	...localizeRelease(r),
	icon: (r.icon && ICONS[r.icon]) || '',
}))
