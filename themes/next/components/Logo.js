import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'

const Logo = props => {
  const { className } = props
  return (
    <SmartLink href='/' passHref legacyBehavior>
      <div
        className={
          'flex flex-col justify-center items-center cursor-pointer bg-white dark:bg-gray-900 space-y-2 font-bold border-b border-[rgba(0,85,119,0.12)] pb-4 ' +
          className
        }>
        <div
          data-aos='fade-down'
          data-aos-duration='500'
          data-aos-once='true'
          data-aos-anchor-placement='top-bottom'
          className='font-sans text-xl font-bold text-[#005577] logo'>
          {' '}
          {siteConfig('TITLE')}
        </div>
        <div
          data-aos='fade-down'
          data-aos-duration='500'
          data-aos-delay='300'
          data-aos-once='true'
          data-aos-anchor-placement='top-bottom'
          className='text-sm text-[#778da9] font-light text-center'>
          {' '}
          {siteConfig('DESCRIPTION')}
        </div>
      </div>
    </SmartLink>
  )
}
export default Logo
