// Картинки бренда из знака "точка боли" (components/logo.svelte): фавикон, иконка приложения,
// аватар, OG-картинка и баннер README. Пересобирать, когда меняется знак или дескриптор.
//
// usage: node scripts/brand/render.mjs
// Нужны Playwright из зависимостей сайта и ImageMagick (`magick`). Слово набрано системным
// скруглённым шрифтом (ui-rounded), он есть только на macOS: запускать там.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import { site } from '#frontend/data/site.ts'
import { sportOf } from '#frontend/data/sports.ts'

const root = fileURLToPath(new URL('../../', import.meta.url))
const poster = fs.readFileSync(`${root}public/model/poster.png`).toString('base64')

const GRAPHITE = '#1d1d1f'
const GRAY = '#8e8e93'
const PAPER = '#f5f5f7'

/** Знак в квадрате 32x32: кружок и кольцо, геометрия та же, что у логотипа. */
const mark = (color) =>
	`<circle cx="16" cy="16" r="7.5" fill="${color}"/>` +
	`<circle cx="16" cy="16" r="12.75" fill="none" stroke="${color}" stroke-width="2.5"/>`

// Вкладка браузера бывает тёмной и при светлой теме сайта, поэтому знак лежит на белом круге:
// на светлой вкладке круга не видно, на тёмной он держит графит
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
	<!-- Собирается scripts/brand/render.mjs -->
	<circle cx="16" cy="16" r="16" fill="#ffffff" />
	${mark(GRAPHITE)}
</svg>
`

fs.writeFileSync(`${root}public/favicon.svg`, favicon)

const wordmark = (size) =>
	`<span style="font: 700 ${size}px/1 ui-rounded, 'SF Pro Rounded', system-ui; letter-spacing: -0.02em">` +
	`<span style="color: ${GRAPHITE}">sore</span><span style="color: ${GRAY}">body</span></span>`

/** Иконка: графитовый знак на светлом поле, как была гиря. iOS сам скругляет углы. */
const icon = (size) => `<body style="margin: 0; display: grid; place-items: center; width: ${size}px;
	height: ${size}px; background: ${PAPER}">
	<svg viewBox="0 0 32 32" width="${size * 0.62}" height="${size * 0.62}">${mark(GRAPHITE)}</svg></body>`

// Точки зон на фигуре -- цветами спортов: сайт не про один спорт
const accent = (slug) => sportOf(slug).accent.light
const spot = (x, y, color) =>
	`<svg viewBox="0 0 32 32" width="34" height="34" style="position: absolute; left: ${x - 17}px; top: ${y - 17}px">` +
	`<circle cx="16" cy="16" r="7.5" fill="${color}" stroke="#ffffff" stroke-width="2"/>` +
	`<circle cx="16" cy="16" r="12.75" fill="none" stroke="${color}" stroke-width="2.5" opacity="0.5"/></svg>`

/** Карточка для превью ссылки и баннера README: знак со словом, дескриптор и фигура с точками. */
const card = (tagline, lead) => `<body style="margin: 0; width: 1200px; height: 630px; overflow: hidden;
	background: ${PAPER}; font-family: system-ui; display: grid; grid-template-columns: 1fr 380px">
	<div style="padding: 0 0 0 88px; display: flex; flex-direction: column; justify-content: center; gap: 28px">
		<div style="display: flex; align-items: center; gap: 18px">
			<svg viewBox="0 0 32 32" width="84" height="84">${mark(GRAY)}</svg>${wordmark(84)}
		</div>
		<div style="font-size: 40px; font-weight: 700; color: ${GRAPHITE}; letter-spacing: -0.01em">${tagline}</div>
		<div style="font-size: 26px; line-height: 1.4; color: #6e6e73; max-width: 700px">${lead}</div>
	</div>
	<div style="position: relative">
		<img src="data:image/png;base64,${poster}" style="position: absolute; height: 600px; top: 30px; left: 0">
		${spot(209, 180, accent('crossfit'))}${spot(147, 442, accent('football'))}${spot(186, 552, accent('running'))}
	</div>
</body>`

// Подзаголовок карточки, по смыслу -- site.description
const LEAD = 'Как часто случаются в каждом виде спорта, симптомы, когда к врачу и как адаптировать тренировки'

const browser = await chromium.launch({ headless: true })

async function shot(html, width, height, out, scale = 1) {
	const page = await (await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale })).newPage()

	await page.setContent(html)
	await page.screenshot({ path: out })
	await page.close()
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-'))

await shot(icon(180), 180, 180, `${tmp}/apple-touch-icon.png`)
await shot(icon(512), 512, 512, `${tmp}/avatar-512.png`)

await shot(card(site.tagline, LEAD), 1200, 630, `${tmp}/og.png`)

await shot(card(site.tagline, LEAD), 1200, 630, `${tmp}/banner.png`, 2)

await shot(
	card(
		'Sports pain reference',
		'How common each kind of pain is in every sport, its symptoms, when to see a doctor and how to adapt training',
	),
	1200,
	630,
	`${tmp}/banner.en.png`,
	2,
)

await browser.close()

const png = (from, to) => execFileSync('magick', [from, '-strip', '-define', 'png:compression-level=9', to])
const jpg = (from, to) => execFileSync('magick', [from, '-resize', '1600x', '-strip', '-quality', '86', to])

fs.mkdirSync(`${root}.github/assets`, { recursive: true })
png(`${tmp}/apple-touch-icon.png`, `${root}public/apple-touch-icon.png`)
png(`${tmp}/avatar-512.png`, `${root}public/brand/avatar-512.png`)
png(`${tmp}/og.png`, `${root}public/brand/og.png`)
jpg(`${tmp}/banner.png`, `${root}.github/assets/banner.jpg`)
jpg(`${tmp}/banner.en.png`, `${root}.github/assets/banner.en.jpg`)
fs.rmSync(tmp, { recursive: true })

for (const file of [
	'public/favicon.svg',
	'public/apple-touch-icon.png',
	'public/brand/avatar-512.png',
	'public/brand/og.png',
	'.github/assets/banner.jpg',
	'.github/assets/banner.en.jpg',
])
	console.log(file, fs.statSync(`${root}${file}`).size, 'bytes')
