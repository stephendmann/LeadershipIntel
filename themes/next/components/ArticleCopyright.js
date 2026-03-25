import Image from 'next/image'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import { siteConfig } from '@/lib/config'

/**
 * Author bio card — replaces the default copyright block.
 * Shown at the bottom of each post when NEXT_ARTICLE_COPYRIGHT is true.
 */
export default function ArticleCopyright() {
  if (!siteConfig('NEXT_ARTICLE_COPYRIGHT', null, CONFIG)) {
    return <></>
  }

  const author = siteConfig('AUTHOR', 'LeadershipIntel')
  const bio = siteConfig('BIO', 'Leadership insights and resources')
  const avatar = siteConfig('AVATAR', '')
  const siteLink = siteConfig('LINK', '')
  const linkedin = siteConfig('CONTACT_LINKEDIN', '')
  const twitter = siteConfig('CONTACT_TWITTER', '')
  const email = siteConfig('CONTACT_EMAIL', '')

  return (
    <section className='mt-8 border-t border-gray-200 dark:border-gray-700 pt-6'>
      <div className='flex items-start gap-4'>
        {avatar && (
          <div className='flex-shrink-0'>
            <Image
              src={avatar}
              alt={author}
              width={64}
              height={64}
              className='rounded-full object-cover'
            />
          </div>
        )}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 flex-wrap'>
            <SmartLink
              href={siteLink || '/about'}
              className='text-base font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400'>
              {author}
            </SmartLink>
            {linkedin && (
              <a
                href={linkedin}
                target='_blank'
                rel='noopener noreferrer'
                aria-label='LinkedIn'
                className='text-blue-600 dark:text-blue-400 hover:opacity-75'>
                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                </svg>
              </a>
            )}
            {twitter && (
              <a
                href={twitter}
                target='_blank'
                rel='noopener noreferrer'
                aria-label='Twitter / X'
                className='text-gray-700 dark:text-gray-300 hover:opacity-75'>
                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.261 5.635 5.903-5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                </svg>
              </a>
            )}
            {email && (
              <a
                href={`mailto:${atob(email)}`}
                aria-label='Email'
                className='text-gray-500 dark:text-gray-400 hover:opacity-75'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
                </svg>
              </a>
            )}
          </div>
          {bio && (
            <p className='mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed'>
              {bio}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
