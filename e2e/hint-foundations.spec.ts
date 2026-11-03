import { expect, test } from '@playwright/test'

test('декоративная подсказка обновляет подпись и закрывается при жесте', async ({ page }) => {
	await page.goto('/')
	const button = page.getByRole('button', { name: 'Все', exact: true })
	const tip = page.locator('body > .tip--hint')

	await button.hover()
	await expect(tip).toBeVisible()
	await expect(tip).toHaveAttribute('aria-hidden', 'true')
	await expect(tip).toHaveAttribute('popover', 'manual')
	await expect(button).not.toHaveAttribute('aria-describedby')

	await button.evaluate((node) => {
		node.dataset.hint = 'Новая подпись'
	})

	await expect(tip).toHaveText('Новая подпись')
	await button.dispatchEvent('scroll')
	await expect(tip).toBeVisible()
	expect((await tip.boundingBox())!.x).toBeGreaterThanOrEqual(16)
	await page.mouse.down()
	await expect(tip).toBeHidden()
	await page.mouse.up()
	await page.mouse.move(0, 0)
	await button.hover()
	await expect(tip).toBeVisible()
	await page.keyboard.press('Escape')
	await expect(tip).toBeHidden()
	await button.dispatchEvent('pointerover', { pointerType: 'touch' })
	await page.waitForTimeout(200)
	await expect(tip).toBeHidden()
})

test('подсказка с клавиатуры остаётся при движении мыши между обычными блоками', async ({ page }) => {
	await page.goto('/')
	const chip = page.getByRole('button', { name: 'Все', exact: true })

	await chip.focus()
	await page.keyboard.press('Shift+Tab')
	await page.keyboard.press('Tab')
	await expect(chip).toBeFocused()
	const tip = page.locator('body > .tip--hint')

	await expect(tip).toBeVisible()

	await page.evaluate(() => {
		for (const left of [400, 600]) {
			const block = document.createElement('div')

			block.textContent = 'Обычный блок'
			block.style.cssText = 'position:fixed;z-index:999;top:100px;width:100px;height:100px;left:' + left + 'px'
			document.body.append(block)
		}
	})

	await page.mouse.move(450, 150)
	await page.mouse.move(650, 150)
	await expect(chip).toBeFocused()
	await expect(tip).toBeVisible()
})
