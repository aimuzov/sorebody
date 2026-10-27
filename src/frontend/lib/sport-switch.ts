import { currentSection as sectionInView } from '@aimuzov/infra-site-kit/section-spy.js'

/**
 * Раздел статьи, который сейчас читают: при смене спорта в «Разбор ‹в кроссфите ▾›»
 * (components/sport-switch.svelte) статья другого спорта открывается на нём же. Разделы у статей
 * спорта одни и те же (lib/article-html.ts), поэтому якорь там найдётся. Это последний раздел,
 * чей заголовок уже поднялся в верхнюю треть экрана; в начале статьи -- никакого.
 */
export function currentSection(root: ParentNode) {
	return sectionInView(root.querySelectorAll<HTMLElement>('.article-section[id]'))?.id
}

/**
 * Ключ в sessionStorage: на сколько граней крутили барабан, когда выбрали спорт на отдельной
 * странице статьи. Плюс -- новый спорт пришёл снизу, минус -- сверху. Его ставит переключатель
 * перед переходом, читает переход между страницами (SPORT_TRANSITION) и стирает новая страница.
 */
export const ROLL_KEY = 'sport-switch-roll'

/**
 * Переход между страницами (View Transitions, styles/global.css) -- только при смене спорта: на
 * старой и на новой странице он получает тип по направлению барабана, и фраза спорта уезжает
 * туда же, куда крутили. Остальные переходы по сайту пропускаются и остаются мгновенными.
 * Встроенный скрипт в `<head>` (layouts/base.astro): `pagereveal` новой страницы приходит до
 * модульных скриптов. Текст постоянный: хеш для CSP один на все страницы.
 */
export const SPORT_TRANSITION = [
	'try{',
	`var k=${JSON.stringify(ROLL_KEY)},f=function(e){var t=e.viewTransition;if(!t)return;`,
	'var r=0;try{r=Number(sessionStorage.getItem(k))}catch(x){}',
	"if(!r)return t.skipTransition();t.types.add(r>0?'roll-next':'roll-prev')};",
	"addEventListener('pageswap',f);addEventListener('pagereveal',f)",
	'}catch(e){}',
].join('')
