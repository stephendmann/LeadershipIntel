import LazyImage from '@/components/LazyImage'
import SocialButton from './SocialButton'
import { siteConfig } from '@/lib/config'

const InfoCard = (props) => {
  const { siteInfo } = props
  return <>
    <div className='flex flex-col items-center justify-center '>
        <div className='transform duration-200'>
          <LazyImage src={siteConfig('AVATAR')} className='rounded-full' width={120} alt={siteConfig('AUTHOR')}/>
        </div>
        <div className='text-2xl font-sans dark:text-white py-2 hover:scale-105 transform duration-200'>{siteConfig('AUTHOR')}</div>
        <div className='font-light dark:text-white py-2 hover:scale-105 transform duration-200 text-center'>{siteConfig('BIO')}</div>
        <a href='/' className='mt-2 mb-1 inline-block px-5 py-1 border border-[#005577] text-[#005577] dark:text-gray-300 dark:border-gray-400 text-sm font-sans hover:bg-[#005577] hover:text-white dark:hover:bg-gray-600 transition-colors duration-200'>
          Home
        </a>
        <SocialButton/>
    </div>
  </>
}

export default InfoCard
