import { pageTitle as sharedPageTitle } from '@aimuzov/infra-site-kit/title.js'

import { site } from '#frontend/data/site.ts'

/** Название сайта с дескриптором: `og:site_name` и заголовок страницы без своего названия. */
export const siteTitle = `${site.name} — ${site.tagline}`

/** Заголовок страницы: своё название и через тире название сайта. */
export function pageTitle(title?: string) {
	return sharedPageTitle(title, { siteName: site.name, homeTitle: siteTitle })
}

/**
 * Название травмы без другого названия в скобках в конце: «Разрыв передней крестообразной
 * связки (ПКС)» -> «Разрыв передней крестообразной связки» и «ПКС». Скобки с запятой -- уточнение,
 * а не второе имя («Растяжения мышц (дельтовидная, трапециевидная, …)»), их оставляем в названии.
 */
export function splitTitle(title: string): { name: string; alias?: string } {
	const match = title.match(/^(.*\S)\s*\(([^(),]+)\)$/)

	return match ? { name: match[1], alias: match[2].trim() } : { name: title }
}
