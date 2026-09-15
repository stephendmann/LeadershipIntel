import BLOG, { LAYOUT_MAPPINGS } from '@/blog.config'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { getQueryParam, getQueryVariable, isBrowser } from '../lib/utils'

// 在next.config.js中扫描所有主题
export const { THEMES = [] } = getConfig()?.publicRuntimeConfig || {}
const baseLayoutCache = new Map()
const layoutByThemeCache = new Map()
let domFixTimer = null

const LayoutLoading = () => (
  <div className='min-h-screen w-full bg-[#f6f6f1] dark:bg-black' />
)

const EmptyBaseLayout = ({ children }) => <>{children}</>
const EmptyPageLayout = () => null

const IndexLayoutLoading = () => (
  <div className='pt-10 md:pt-18 w-full bg-[#f6f6f1] dark:bg-black'>
    <div className='mx-auto w-full max-w-screen-3xl px-4 py-10 lg:px-0'>
      <div className='grid gap-10 xl:grid-cols-2'>
        <section className='space-y-5'>
          <div className='h-80 w-full animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-10 w-4/5 animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-4 w-2/3 animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-4 w-24 animate-pulse bg-gray-200 dark:bg-gray-800' />
        </section>
        <section className='space-y-6'>
          <div className='h-48 w-full animate-pulse bg-gray-200 dark:bg-gray-800' />
          {[0, 1].map(item => (
            <div
              key={item}
              className='flex gap-6 border-t border-gray-300 pt-6 dark:border-gray-800'>
              <div className='min-w-0 flex-1 space-y-3'>
                <div className='h-6 w-4/5 animate-pulse bg-gray-200 dark:bg-gray-800' />
                <div className='h-4 w-2/3 animate-pulse bg-gray-200 dark:bg-gray-800' />
                <div className='h-4 w-20 animate-pulse bg-gray-200 dark:bg-gray-800' />
              </div>
              <div className='h-32 w-32 shrink-0 animate-pulse bg-gray-200 dark:bg-gray-800' />
            </div>
          ))}
        </section>
      </div>

      <section className='mt-12'>
        <div className='flex items-center justify-between'>
          <div className='h-7 w-28 animate-pulse bg-gray-200 dark:bg-gray-800' />
          <div className='h-5 w-24 animate-pulse bg-gray-200 dark:bg-gray-800' />
        </div>
        <div className='mt-6 grid gap-8 md:grid-cols-2 xl:grid-cols-4'>
          {[0, 1, 2, 3].map(item => (
            <div
              key={item}
              className='space-y-4 border-t border-gray-300 pt-5 dark:border-gray-800'>
              <div className='h-5 w-3/4 animate-pulse bg-gray-200 dark:bg-gray-800' />
              <div className='h-4 w-24 animate-pulse bg-gray-200 dark:bg-gray-800' />
            </div>
          ))}
        </div>
      </section>
    </div>
  </div>
)

const getLayoutLoading = layoutName => {
  if (layoutName === 'LayoutIndex') {
    return IndexLayoutLoading
  }
  return LayoutLoading
}

const normalizeThemeName = themeValue => {
  if (!themeValue || typeof themeValue !== 'string') return BLOG.THEME
  const firstTheme = themeValue.split(',')[0].trim()
  if (!firstTheme) return BLOG.THEME
  return THEMES.includes(firstTheme) ? firstTheme : BLOG.THEME
}

const getFallbackThemeName = themeName => {
  const preferred = normalizeThemeName(BLOG.THEME)
  if (preferred && preferred !== themeName) return preferred
  if (THEMES.includes('example') && themeName !== 'example') return 'example'
  return THEMES.find(item => item !== themeName) || null
}

const getThemeExport = (mod, exportName) => {
  if (mod?.[exportName]) return mod[exportName]
  if (mod?.default?.[exportName]) return mod.default[exportName]
  if (exportName === 'LayoutBase' && typeof mod?.default === 'function') {
    return mod.default
  }
  return null
}

const scheduleFixThemeDOM = (delay = 120) => {
  if (!isBrowser) return
  if (domFixTimer) {
    clearTimeout(domFixTimer)
  }
  domFixTimer = setTimeout(() => {
    fixThemeDOM()
    domFixTimer = null
  }, delay)
}

async function importThemeConfig(themeFolderName) {
  try {
    const mod = await import(`@/themes/${themeFolderName}`)
    return getThemeExport(mod, 'THEME_CONFIG')
  } catch (err) {
    console.error(`Failed to load theme config "${themeFolderName}":`, err)
    return null
  }
}

async function importThemeLayout(themeFolderName, layoutName) {
  try {
    const mod = await import(`@/themes/${themeFolderName}`)
    return (
      getThemeExport(mod, layoutName) ||
      getThemeExport(mod, 'LayoutSlug') ||
      null
    )
  } catch (err) {
    console.error(`Failed to load theme "${themeFolderName}":`, err)
    return null
  }
}

async function resolveThemeLayout(themeName, layoutName, emptyLayout) {
  let Layout = await importThemeLayout(themeName, layoutName)
  if (Layout) return Layout

  const fallback = getFallbackThemeName(themeName)
  if (fallback) {
    Layout = await importThemeLayout(fallback, layoutName)
    if (Layout) {
      console.warn(
        `[theme] "${themeName}" missing "${layoutName}", using fallback "${fallback}".`
      )
      return Layout
    }
  }

  console.warn(`[theme] "${themeName}" missing "${layoutName}", using empty layout.`)
  return emptyLayout
}

/**
 * 获取主题配置（始终动态加载，与运行时 BLOG.THEME / URL ?theme 一致；不依赖编译期别名）。
 * @param {string} themeQuery - 主题查询参数（支持多个主题用逗号分隔）
 * @returns {Promise<object|null>} 主题配置对象
 */
export const getThemeConfig = async themeQuery => {
  const themeName = normalizeThemeName(themeQuery)
  let cfg = await importThemeConfig(themeName)
  if (cfg) {
    return cfg
  }
  const fallback = normalizeThemeName(BLOG.THEME)
  if (fallback !== themeName) {
    cfg = await importThemeConfig(fallback)
    if (cfg) {
      console.warn(
        `[theme] "${themeName}" config unavailable, using fallback "${fallback}".`
      )
      return cfg
    }
  }
  console.warn('[theme] No theme configuration could be loaded, using empty config.')
  return {}
}

/**
 * Statically analysable base-layout loaders for the themes this site enables.
 *
 * next/dynamic can only preload a module for server rendering when the import
 * is literal, so its module id can be recorded in the build's loadable
 * manifest. A template-literal import -- dynamic(() => import(`@/themes/${x}`))
 * -- produces a webpack context module with no single id, so nothing is
 * preloaded: on a cold lambda the component renders null before the promise
 * settles, and because the base layout wraps <SEO> and <Component> in
 * pages/_app.js, the whole page head and body were discarded. That shipped
 * HTTP 200 pages with no <title> and no content to crawlers.
 *
 * So the imports below are literal. But this map lists only the themes the site
 * actually serves, not every folder under themes/.
 *
 * The reason is that entries here are not lazy on the server. Next calls
 * Loadable.preloadAll() during server rendering (next/dist/server/render.js),
 * which loads every registered loadable regardless of which theme renders. An
 * earlier revision of this file mapped all 25 bundled themes and asserted they
 * "stay code-split"; that was wrong. themes/claude imports isomorphic-dompurify
 * at module scope, and its jsdom dependency reaches html-encoding-sniffer --
 * CommonJS requiring an ESM-only @exodus/bytes. Node 22 tolerates that locally;
 * the Vercel lambda's bundled loader does not. Every cold render of every route
 * threw ERR_REQUIRE_ESM and returned HTTP 500, while the site rendered theme
 * "next" and never used claude at all.
 *
 * To enable another theme, add its literal import here as well as setting
 * NEXT_PUBLIC_THEME. A theme requested but absent from this map falls back via
 * getFallbackThemeName to BLOG.THEME and logs a warning; it does not blank the
 * page. The theme folders themselves are left in place.
 */
const THEME_BASE_LAYOUTS = {
  next: dynamic(
    () => import('@/themes/next').then(m => getThemeExport(m, 'LayoutBase') || EmptyBaseLayout),
    { ssr: true }
  ),
}

/**
 * 获取当前主题（query 主题优先，且做合法性校验）
 */
const getCurrentTheme = (router, fallbackTheme) => {
  const queryTheme = getQueryParam(router?.asPath, 'theme')
  if (queryTheme) {
    return normalizeThemeName(queryTheme)
  }
  return normalizeThemeName(fallbackTheme || BLOG.THEME)
}

/**
 * 加载全局布局
 * @param {*} theme
 * @returns
 */
export const getBaseLayoutByTheme = theme => {
  const normalizedTheme = normalizeThemeName(theme)
  if (baseLayoutCache.has(normalizedTheme)) {
    return baseLayoutCache.get(normalizedTheme)
  }

  // Same fallback order as resolveThemeLayout: requested theme, then the
  // configured default, then a pass-through that never drops its children.
  let DynamicBaseLayout = THEME_BASE_LAYOUTS[normalizedTheme]
  if (!DynamicBaseLayout) {
    const fallback = getFallbackThemeName(normalizedTheme)
    DynamicBaseLayout = fallback ? THEME_BASE_LAYOUTS[fallback] : undefined
    if (DynamicBaseLayout) {
      console.warn(
        `[theme] "${normalizedTheme}" has no base layout, using fallback "${fallback}".`
      )
    }
  }
  if (!DynamicBaseLayout) {
    console.warn(`[theme] "${normalizedTheme}" has no base layout, using empty layout.`)
    DynamicBaseLayout = EmptyBaseLayout
  }

  baseLayoutCache.set(normalizedTheme, DynamicBaseLayout)
  return DynamicBaseLayout
}

/**
 * 动态获取布局
 * @param {*} props
 */
export const DynamicLayout = props => {
  const { theme, layoutName } = props
  const SelectedLayout = useLayoutByTheme({ layoutName, theme })
  return <SelectedLayout {...props} />
}

/**
 * 加载主题文件
 * @param {*} layoutName
 * @param {*} theme
 * @returns
 */
export const useLayoutByTheme = ({ layoutName, theme }) => {
  const router = useRouter()
  const themeQuery = getCurrentTheme(router, theme)
  const cacheKey = `${themeQuery}:${layoutName}`

  if (layoutByThemeCache.has(cacheKey)) {
    scheduleFixThemeDOM(themeQuery === BLOG.THEME ? 80 : 240)
    return layoutByThemeCache.get(cacheKey)
  }

  const loadLayout = () =>
    resolveThemeLayout(themeQuery, layoutName, EmptyPageLayout)
  const DynamicLayoutComponent = dynamic(loadLayout, {
    ssr: true,
    loading: getLayoutLoading(layoutName)
  })
  layoutByThemeCache.set(cacheKey, DynamicLayoutComponent)
  scheduleFixThemeDOM(themeQuery === BLOG.THEME ? 80 : 240)
  return DynamicLayoutComponent
}

/**
 * 根据路径 获取对应的layout名称
 * @param {*} path
 * @returns
 */
const getLayoutNameByPath = path => {
  const layoutName = LAYOUT_MAPPINGS[path] || 'LayoutSlug'
  //   console.log('path-layout',path,layoutName)
  return layoutName
}

/**
 * 切换主题时的特殊处理
 * 删除多余的元素
 */
const fixThemeDOM = () => {
  if (isBrowser) {
    const elements = document.querySelectorAll('[id^="theme-"]')
    if (elements?.length > 1) {
      for (let i = 0; i < elements.length - 1; i++) {
        if (
          elements[i] &&
          elements[i].parentNode &&
          elements[i].parentNode.contains(elements[i])
        ) {
          elements[i].parentNode.removeChild(elements[i])
        }
      }
      elements[0]?.scrollIntoView()
    }
  }
}

/**
 * 初始化主题 , 优先级 query > cookies > systemPrefer
 * @param isDarkMode
 * @param updateDarkMode 更改主题ChangeState函数
 * @description 读取cookie中存的用户主题
 */
export const initDarkMode = (updateDarkMode, defaultDarkMode) => {
  // 查看用户设备浏览器是否深色模型
  let newDarkMode = isPreferDark()

  // 查看localStorage中用户记录的是否深色模式
  const userDarkMode = loadDarkModeFromLocalStorage()
  if (userDarkMode) {
    newDarkMode = userDarkMode === 'dark' || userDarkMode === 'true'
    saveDarkModeToLocalStorage(newDarkMode) // 用户手动的才保存
  }

  // 如果站点强制设置默认深色，则优先级改过用
  if (defaultDarkMode === 'true') {
    newDarkMode = true
  }

  // url查询条件中是否深色模式
  const queryMode = getQueryVariable('mode')
  if (queryMode) {
    newDarkMode = queryMode === 'dark'
  }

  updateDarkMode(newDarkMode)
  document
    .getElementsByTagName('html')[0]
    .setAttribute('class', newDarkMode ? 'dark' : 'light')
}

/**
 * 是否优先深色模式， 根据系统深色模式以及当前时间判断
 * @returns {*}
 */
export function isPreferDark() {
  if (BLOG.APPEARANCE === 'dark') {
    return true
  }
  if (BLOG.APPEARANCE === 'auto') {
    // 系统深色模式或时间是夜间时，强行置为夜间模式
    const date = new Date()
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    return (
      prefersDarkMode ||
      (BLOG.APPEARANCE_DARK_TIME &&
        (date.getHours() >= BLOG.APPEARANCE_DARK_TIME[0] ||
          date.getHours() < BLOG.APPEARANCE_DARK_TIME[1]))
    )
  }
  return false
}

/**
 * 读取深色模式
 * @returns {*}
 */
export const loadDarkModeFromLocalStorage = () => {
  return localStorage.getItem('darkMode')
}

/**
 * 保存深色模式
 * @param newTheme
 */
export const saveDarkModeToLocalStorage = newTheme => {
  localStorage.setItem('darkMode', newTheme)
}
