import { positionTooltip, watchTooltip, type TooltipState } from '@aimuzov/infra-site-kit/tooltip.js'

import { pageWidth } from '#frontend/lib/page-gutter.ts'

/** Подпись уже есть в aria-label или тексте, поэтому подсказка только для глаз. */
export function initHints() {
	const tip = document.createElement('span')

	tip.className = 'tip tip--hint'
	tip.popover = 'manual'
	tip.setAttribute('aria-hidden', 'true')
	document.body.append(tip)

	const place = ({ anchor }: TooltipState) => {
		if (!tip.matches(':popover-open')) return

		const rect = anchor.getBoundingClientRect()
		const { width, height } = tip.getBoundingClientRect()
		const placed = positionTooltip({
			point: { x: rect.left + rect.width / 2, y: rect.top },
			bottom: rect.bottom,
			width,
			height,
			viewportWidth: pageWidth(),
			margin: 16,
			gap: 8,
			flip: true,
			topMargin: 4,
		})

		tip.dataset.side = placed.side
		tip.style.top = `${placed.y}px`
		tip.style.left = `${placed.x}px`
	}
	const stop = watchTooltip({
		selector: '[data-hint]',
		content: (anchor) => anchor.dataset.hint,
		attributes: ['data-hint'],
		delay: 150,
		pointerTypes: ['mouse'],
		focusVisibleOnly: true,
		ignoreUnrelatedPointer: true,
		keydown: 'escape',
		scroll: 'move',
		resize: 'move',
		show: (state) => {
			tip.textContent = state.text

			if (!tip.matches(':popover-open')) tip.showPopover()

			place(state)
		},
		hide: () => {
			if (tip.matches(':popover-open')) tip.hidePopover()
		},
		move: place,
	})

	return () => {
		stop()
		tip.remove()
	}
}
