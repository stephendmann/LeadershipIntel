import { siteConfig } from '@/lib/config'

const Logo = props => {
  const { className, onDark } = props
  return (
    <div
      className={
        'flex flex-col justify-center items-center bg-white dark:bg-gray-900 space-y-2 font-bold border-b border-[rgba(0,85,119,0.12)] pb-4 ' +
        className
      }>
      {/* Mobile nav: show title (desktop shows full-width header above layout) */}
      <div
        className={`block lg:hidden font-sans text-xl font-bold ${
          onDark ? 'text-white' : 'text-[#005577] dark:text-white'
        }`}>
        {siteConfig('TITLE')}
      </div>
      <div
        className={`text-sm font-light text-center ${
          onDark ? 'text-[#c7d2e0]' : 'text-[#5b708f] dark:text-gray-400'
        }`}>
        {siteConfig('DESCRIPTION')}
      </div>
    </div>
  )
}
export default Logo
