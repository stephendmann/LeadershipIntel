import { siteConfig } from '@/lib/config'

const Logo = props => {
  const { className } = props
  return (
    <div
      className={
        'flex flex-col justify-center items-center bg-white dark:bg-gray-900 space-y-2 font-bold border-b border-[rgba(0,85,119,0.12)] pb-4 ' +
        className
      }>
      {/* Mobile nav: show title (desktop shows full-width header above layout) */}
      <div className='block lg:hidden font-sans text-xl font-bold text-[#005577] dark:text-white'>
        {siteConfig('TITLE')}
      </div>
      <div className='text-sm text-[#778da9] font-light text-center'>
        {siteConfig('DESCRIPTION')}
      </div>
    </div>
  )
}
export default Logo
