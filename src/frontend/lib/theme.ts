import { themePeek } from '@aimuzov/infra-site-kit/theme-peek.js'
import {
	currentTheme,
	nextTheme,
	systemScheme,
	toggleTheme,
	watchTheme,
	type Scheme,
	type Theme,
} from '@aimuzov/infra-site-kit/theme.js'

/**
 * Тема сайта: как в системе, светлая или тёмная, логика в infra-site-kit. До отрисовки выбор
 * ставит ThemeBoot в layouts/base.astro. В Mini App тему задаёт Telegram, переключатель там скрыт.
 */
export type { Theme }

/** Ключ выбора в localStorage, тот же у ThemeBoot. */
export const THEME_KEY = 'sorebody:theme'

const LABEL: Record<Theme, string> = { auto: 'как в системе', light: 'светлая', dark: 'тёмная' }
const ENABLE: Record<Scheme, string> = { light: 'Включить светлую', dark: 'Включить тёмную' }

/** Действие следующего клика. Без `system` (на сервере) считаем систему светлой. */
function themeAction(theme: Theme, system: Scheme = 'light') {
	const next = nextTheme(theme, system)

	return next === 'auto' ? 'Вернуть как в системе' : ENABLE[next]
}

export const themeLabel = (theme: Theme, system?: Scheme) => `Тема: ${LABEL[theme]}. ${themeAction(theme, system)}`

/**
 * Круги подсмотра, в которые уже копируем канвасы: observer видит каждый круг не один раз.
 *
 * В копии страницы канвас 3D-модели пустой: cloneNode не переносит картинку. Кадр WebGL
 * живёт до конца кадра браузера, поэтому копируем его в своём requestAnimationFrame -- он
 * идёт после отрисовки сцены, -- и так каждый кадр, пока круг открыт: модель вертится.
 */
const copying = new WeakSet<Element>()

function copyCanvases(peek: Element) {
	if (copying.has(peek)) return

	copying.add(peek)

	const step = () => {
		if (!peek.isConnected) return copying.delete(peek)

		const sources = [...document.querySelectorAll('canvas')].filter((c) => !c.closest('.theme-peek'))

		peek.querySelectorAll('canvas').forEach((copy, i) => {
			const source = sources[i]

			const context = copy.getContext('2d')

			// Канвас сцены прозрачный: без очистки на копии копились бы прошлые кадры
			context?.clearRect(0, 0, copy.width, copy.height)

			if (source) context?.drawImage(source, 0, 0)
		})

		requestAnimationFrame(step)
	}

	requestAnimationFrame(step)
}

/**
 * Иконку нужного состояния показывает CSS по `<html data-theme>`, так что она верна уже на
 * первой отрисовке. Скрипт ведёт клики, подпись для скринридера и подсмотр темы из kit:
 * круг показывает схему, которую даст следующий клик.
 */
export function initThemeToggle() {
	const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]')

	if (!button) return

	const sync = () => {
		button.setAttribute('aria-label', themeLabel(currentTheme(), systemScheme()))

		// Подсказка (lib/hint.ts) называет то, что даст клик
		button.dataset.hint = themeAction(currentTheme(), systemScheme())
	}

	button.addEventListener('click', () => toggleTheme({ key: THEME_KEY }))

	// Круг по умолчанию показывает противоположную схему, ровно её и даст клик
	themePeek(button)
	// Подпись зависит и от выбора, и от системной схемы, а та может смениться, пока страница открыта.
	// Первый раз watchTheme зовёт sync сразу, отдельный вызов в конце не нужен
	watchTheme(sync)

	// Копия страницы в круге подсмотра заполняется заново при каждой смене схемы
	new MutationObserver((records) => {
		for (const { target } of records)
			if (target instanceof Element && target.matches('.theme-peek')) copyCanvases(target)
	}).observe(document.body, { childList: true, subtree: true })
}
