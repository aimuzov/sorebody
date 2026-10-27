import { watchSection } from '@aimuzov/infra-site-kit/section-spy.js'

import { initFigure3d } from './figure-3d.ts'
import { keepReadingPlace } from './reading-place.ts'
import { initSectionLinks } from './section-link.ts'
import { initSourcesPeek } from './sources-peek.ts'
import { initArticleTips } from './tip.ts'
import { initTocMenu } from './toc-menu.ts'

/**
 * Чтение лонгрида: полоса прогресса сверху и активный раздел в оглавлении. Одно и то же
 * для отдельной страницы статьи (скроллится окно) и статьи поверх модели на главной
 * (скроллится свой контейнер). Возвращает функцию, которая всё снимает.
 */
export function initReading(root: Element, scroller: HTMLElement | Window, bar: HTMLElement | null) {
	const box = scroller instanceof Window ? document.documentElement : scroller
	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
	const toc = root.querySelector<HTMLElement>('.article__toc')
	const links = [...root.querySelectorAll<HTMLAnchorElement>('[data-toc] a')]
	const sections = links.flatMap((link) => root.querySelector(`#${CSS.escape(link.hash.slice(1))}`) ?? [])
	// Уход заголовка в шапку: там, где CSS умеет привязать анимацию к пути заголовка, он всё делает сам
	const titleByScript = !CSS.supports('(timeline-scope: none) and (animation-timeline: view())')
	const title = root.querySelector<HTMLElement>('.article__title')
	const header = (scroller instanceof Window ? document : scroller).querySelector<HTMLElement>('.site-header')
	let frame = 0

	// Сколько пикселей заголовок уже прошёл под строку шапки, как exit у view-timeline
	// в styles/article.css. Место заголовка -- без его же сдвига, иначе уход вверх ускорял бы сам себя
	const titleExit = () => {
		if (!title || !header) return 0

		const rowBottom = header.getBoundingClientRect().bottom - parseFloat(getComputedStyle(header).paddingBottom)
		const top = title.getBoundingClientRect().top - new DOMMatrix(getComputedStyle(title).transform).m42

		return rowBottom - top
	}
	const span = (p: number, from: number, to: number) => Math.min(1, Math.max(0, (p - from) / (to - from)))

	// Длинное оглавление проезжает за то же время, что и страница: начало видно в начале статьи,
	// конец -- в конце. Шагает целыми пунктами, поровну на каждый отрезок страницы, чтобы у края
	// не висела половина строки. На узком экране оно скрыто, и сдвигать нечего
	let tocStep = -1
	const moveToc = (progress: number) => {
		if (!toc) return

		const tail = parseFloat(toc.style.getPropertyValue('--toc-tail')) || 0
		const max = toc.scrollHeight - toc.clientHeight - tail
		const items = [...toc.querySelectorAll<HTMLElement>('li')]
		const first = items[0]?.offsetTop ?? 0
		const tops = items.map((li) => li.offsetTop - first)
		// Низ списка редко приходится на начало пункта: место под последним пунктом добирается до
		// ближайшего, и в конце у верхнего края тоже целая строка
		const end = tops.find((top) => top >= max) ?? max
		const steps = tops.filter((top) => top <= end)
		const step = Math.round(progress * (steps.length - 1))

		toc.style.setProperty('--toc-tail', `${end - max}px`)

		if (step === tocStep) return

		// Первый шаг -- сразу на место: открытая с середины страница не прокручивает оглавление на глазах
		toc.scrollTo({ top: steps[step], behavior: tocStep < 0 || reduceMotion ? 'instant' : 'smooth' })
		tocStep = step
	}

	const update = () => {
		frame = 0
		const max = box.scrollHeight - box.clientHeight
		const y = box.scrollTop

		const progress = max > 0 ? Math.min(1, y / max) : 0

		bar?.style.setProperty('transform', `scaleX(${progress})`)

		moveToc(progress)

		// Те же диапазоны, что animation-range в styles/article.css
		if (titleByScript) {
			const exit = titleExit()

			box.style.setProperty('--title-out', String(span(exit, 0, 60)))
			box.style.setProperty('--title-in', String(span(exit, 12, 48)))
			box.style.setProperty('--logo-out', String(span(exit, 0, 24)))
			box.style.setProperty('--logo-visibility', exit >= 24 ? 'hidden' : 'visible')
			box.style.setProperty('--title-visibility', exit > 12 ? 'visible' : 'hidden')
		}
	}
	const onScroll = () => {
		frame ||= requestAnimationFrame(update)
	}

	scroller.addEventListener('scroll', onScroll, { passive: true })
	// Первый расчёт -- в следующем кадре: на главной статья в этот момент ещё скрыта,
	// и у всех разделов нулевые координаты. watchSection из infra-site-kit ниже
	// тоже ждёт кадра
	onScroll()

	// Активный -- последний раздел, чей верх уже поднялся выше трети экрана
	const stopSection = watchSection(
		sections,
		(active) => {
			// Шапка статьи (пункт "Начало") -- не раздел: пока читатель в ней, ни один пункт не текущий,
			// а сам пункт "Начало" прячет CSS по data-at-start
			const atStart = active?.id === 'start'

			root.toggleAttribute('data-at-start', atStart)

			// Пустой aria-current скринридер читает как false и текущий раздел не объявит
			for (const link of links) {
				const current = !atStart && link.hash === `#${active?.id}`

				if (current) link.setAttribute('aria-current', 'location')
				else link.removeAttribute('aria-current')
			}
		},
		{ scroller, line: ({ top }) => top + box.clientHeight * 0.3 },
	)

	// Переход к разделу -- из оглавления или ссылкой в тексте, как в пометке "Когда сразу к
	// врачу", -- плавной прокруткой. Хеш раздела -- в адрес, заменой: ссылку на раздел можно
	// скопировать, а "Назад" ведёт со статьи, а не по разделам. "Начало" хеш снимает
	const onClick = (event: Event) => {
		const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
		const target = link && root.querySelector(`#${CSS.escape(link.hash.slice(1))}`)

		if (!target) return

		event.preventDefault()
		target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })

		if (sections.includes(target))
			history.replaceState(
				history.state,
				'',
				target.id === 'start' ? `${location.pathname}${location.search}` : `#${target.id}`,
			)
	}

	root.addEventListener('click', onClick)

	const stopPlace = keepReadingPlace(root, scroller, sections)
	const stopTips = initArticleTips(root, scroller)
	const stopTocMenu = initTocMenu(root)
	const stopSourcesPeek = initSourcesPeek(root)
	const stopFigure3d = initFigure3d(root)
	const stopSectionLinks = initSectionLinks(root)

	return () => {
		stopPlace()
		stopTips()
		stopTocMenu()
		stopSourcesPeek()
		stopFigure3d()
		stopSectionLinks()
		stopSection()
		scroller.removeEventListener('scroll', onScroll)
		root.removeEventListener('click', onClick)
		cancelAnimationFrame(frame)
	}
}
