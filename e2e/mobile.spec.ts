import { expect, test } from '@playwright/test'

// Шторка главной на телефоне. Без `?scene` модель под webdriver не грузится, а индекс работает и без неё
test.use({ viewport: { width: 375, height: 663 }, hasTouch: true, isMobile: true })

test('все зоны помещаются в шторку без горизонтальной прокрутки', async ({ page }) => {
	await page.goto('/')

	const zones = page.locator('.index__zones')
	const rows = zones.locator('.index__zone')

	await expect(rows.last()).toBeInViewport({ ratio: 1 })
	expect(await zones.evaluate((list) => list.scrollWidth <= list.clientWidth)).toBe(true)
})

test('поиск и фильтры прячутся в остров и раскрываются по нажатию', async ({ page }) => {
	await page.goto('/')

	const island = page.locator('.index__island-open')

	await expect(page.locator('.search__input')).toBeHidden()
	await island.tap()
	await expect(page.locator('.search__input')).toBeVisible()
	await expect(page.locator('.search__input')).not.toBeFocused()

	await page.locator('.index__chip', { hasText: 'Редкие' }).tap()
	await page.getByRole('button', { name: 'Свернуть поиск' }).tap()
	await expect(island).toHaveText(/Редкие/)
	await expect(page.locator('.search__input')).toBeHidden()
})

test('список движений в раскрытом острове не уходит за край экрана', async ({ page }) => {
	await page.goto('/')
	await page.locator('.index__island-open').tap()
	// Сразу, не дожидаясь, пока остров дорастёт: tap ждал бы конца анимации
	await page.getByRole('button', { name: /^Движение/ }).dispatchEvent('click')

	const list = page.getByRole('listbox')

	await expect(list).toBeVisible()

	// Мерим, когда остров дорос: посреди анимации сжат и сам список. Бесконечные анимации
	// (покачивание барабана спорта) не кончаются никогда, их не ждём
	await page.waitForFunction(() =>
		document
			.getAnimations()
			.every((a) => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity),
	)

	const box = (await list.boundingBox())!

	expect(box.x).toBeGreaterThanOrEqual(16)
	expect(box.x + box.width).toBeLessThanOrEqual(375 - 16)
})

test('фильтры в раскрытом острове помещаются в ширину экрана', async ({ page }) => {
	await page.goto('/')
	await page.locator('.index__island-open').tap()

	const filters = page.locator('.index__filters')

	await expect(page.locator('.index__chip', { hasText: 'Редкие' })).toBeInViewport({ ratio: 1 })
	expect(await filters.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test.describe('на телефоне 390×844', () => {
	test.use({ viewport: { width: 390, height: 844 } })

	// Заголовок с выбором спорта поднят над подводкой ради списка спортов и рисовался поверх карточки
	test('раскрытый остров с результатами перекрывает заголовок главной', async ({ page }) => {
		await page.goto('/')
		await page.locator('.index__island-open').tap()
		await page.locator('.search__input').fill('связ')

		const results = page.locator('.index__result')

		await expect(results.first()).toBeVisible()

		for (const result of await results.all()) {
			const box = await result.boundingBox()

			expect(box).not.toBeNull()

			const hit = await page.evaluate(
				({ x, y }) => document.elementFromPoint(x, y)?.closest('.index__result') !== null,
				{ x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 },
			)

			expect(hit).toBe(true)
		}
	})
})

test('тап по зоне раскрывает её список', async ({ page }) => {
	await page.goto('/')
	await page.locator('.index__zone', { hasText: 'Плечо' }).tap()

	await expect(page).toHaveURL(/#zone=shoulder/)
	await expect(page.locator('.zone')).toBeVisible()
})

test('кнопка разделов открывает меню и ведёт к разделу', async ({ page }) => {
	await page.goto('/crossfit/acl-tear/')

	const button = page.getByRole('button', { name: 'Разделы статьи' })
	const menu = page.locator('#toc-menu')

	await button.tap()
	await expect(button).toHaveAttribute('aria-expanded', 'true')
	await expect(menu).toBeVisible()

	await menu.getByRole('link', { name: 'Симптомы' }).tap()
	await expect(menu).toBeHidden()
	await expect(button).toHaveAttribute('aria-expanded', 'false')
	await expect(button).toBeFocused()
	await expect(page.locator('#symptoms')).toBeInViewport()
	// Меню уже закрыто, роль скрытой ссылке не достаётся -- ищем по адресу
	await expect(menu.locator('a[href="#symptoms"]')).toHaveAttribute('aria-current', 'location')

	await button.tap()
	await page.keyboard.press('Escape')
	await expect(menu).toBeHidden()
	await expect(button).toBeFocused()
})

test('меню разделов работает и в статье поверх модели', async ({ page }) => {
	await page.goto('/')
	await page.locator('.index__zone', { hasText: 'Колено' }).tap()
	await page.locator('.zone__item', { hasText: 'передней крестообразной' }).tap()

	const reader = page.locator('.reader')
	const button = reader.getByRole('button', { name: 'Разделы статьи' })

	await button.tap()
	await reader.locator('#toc-menu').getByRole('link', { name: 'Профилактика' }).tap()
	await expect(reader.locator('#toc-menu')).toBeHidden()
	await expect(reader.locator('#prevention')).toBeInViewport()
})

test('ссылка «Когда сразу к врачу» в статье поверх модели ведёт к разделу, а не на главную', async ({ page }) => {
	await page.goto('/')
	await page.locator('.index__zone', { hasText: 'Колено' }).tap()
	await page.locator('.zone__item', { hasText: 'передней крестообразной' }).tap()

	const reader = page.locator('.reader')

	await expect(page).toHaveURL(/\/crossfit\/acl-tear\/$/)
	await reader.locator('.article__disclaimer-link').tap()
	await expect(reader.locator('#urgent')).toBeInViewport()
	await expect(page).toHaveURL(/\/crossfit\/acl-tear\/#urgent$/)
	await expect(reader).toBeVisible()
})

test.describe('на широком экране', () => {
	test.use({ viewport: { width: 1280, height: 800 }, hasTouch: false, isMobile: false })

	test('кнопки разделов нет: оглавление сбоку', async ({ page }) => {
		await page.goto('/crossfit/acl-tear/')

		await expect(page.getByRole('button', { name: 'Разделы статьи' })).toBeHidden()
		await expect(page.locator('.article__toc')).toBeVisible()
	})
})

test.describe('на ноутбуке с узкой шторкой', () => {
	test.use({ viewport: { width: 820, height: 900 }, hasTouch: false, isMobile: false })

	test('переключатель частоты одной строкой не вылезает из шторки на модель', async ({ page }) => {
		await page.goto('/')

		const edge = (selector: string) => page.locator(selector).evaluate((el) => el.getBoundingClientRect().right)
		const rare = page.getByRole('button', { name: 'Редкие' })

		expect(await edge('.index__freq')).toBeLessThanOrEqual(await edge('.index'))
		// Невыбранный уровень -- одним знаком, подпись остаётся именем кнопки
		await expect(rare).toBeVisible()
		await rare.click()
		await expect(rare).toHaveAttribute('aria-pressed', 'true')
		expect(await edge('.index__freq')).toBeLessThanOrEqual(await edge('.index'))
	})
})

test.describe('на ноутбуке 1280×720', () => {
	test.use({ viewport: { width: 1280, height: 720 }, hasTouch: false, isMobile: false })

	test('заголовок главной в одну строку, все зоны видны без прокрутки', async ({ page }) => {
		await page.goto('/')

		const title = page.locator('.index__title')
		const zones = page.locator('.index__zones')

		expect(
			await title.evaluate(
				(el) => el.getBoundingClientRect().height < parseFloat(getComputedStyle(el).fontSize) * 2,
			),
		).toBe(true)

		// Сколько пикселей списку не хватает: в сообщении падения видно, на сколько промахнулись
		expect(await zones.evaluate((list) => Math.max(0, list.scrollHeight - list.clientHeight))).toBe(0)
	})
})

test('в только что открытой статье поверх модели ни один раздел не подсвечен', async ({ page }) => {
	await page.goto('/')
	await page.locator('.index__zone', { hasText: 'Колено' }).tap()
	await page.locator('.zone__item', { hasText: 'передней крестообразной' }).tap()
	await page.locator('.reader').getByRole('button', { name: 'Разделы статьи' }).tap()

	await expect(page.locator('.reader #toc-menu a[aria-current]')).toHaveCount(0)
})
