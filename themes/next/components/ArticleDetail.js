import Comment from '@/components/Comment'
import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import WWAds from '@/components/WWAds'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import CONFIG from '../config'
import ArticleCopyright from './ArticleCopyright'
import BlogAround from './BlogAround'
import RecommendPosts from './RecommendPosts'
import TagItem from './TagItem'
import WordCount from '@/components/WordCount'

/**
 * @param {*} param0
 * @returns
 */
export default function ArticleDetail(props) {
  const { post, recommendPosts, prev, next } = props
  const url = siteConfig('LINK') + useRouter().asPath
  const { locale } = useGlobal()
  const showArticleInfo = siteConfig('NEXT_ARTICLE_INFO', null, CONFIG)

  // animation props for cards loaded after first screen
  const aosProps = {
    'data-aos': 'fade-down',
    'data-aos-duration': '400',
    'data-aos-once': 'true',
    'data-aos-anchor-placement': 'top-bottom'
  }

  return (
    <div className='shadow md:hover:shadow-2xl overflow-x-auto flex-grow mx-auto w-screen md:w-full'>
      <div
        itemScope
        itemType='https://schema.org/Movie'
        className='overflow-y-hidden py-10 px-4 lg:pt-24 md:px-24 dark:border-gray-700 bg-white dark:bg-hexo-black-gray'>

          {/* Home link */}
        <div className='mb-6'>
          <a href='/' className='inline-flex items-center text-sm text-[#778da9] hover:text-[#005577] dark:text-gray-400 dark:hover:text-white transition-colors duration-200'>
            <i className='fas fa-arrow-left mr-2' />
            Home
          </a>
        </div>

        {showArticleInfo && (
          <header {...aosProps}>
            {/* Cover image */}
            {siteConfig('NEXT_POST_HEADER_IMAGE_VISIBLE', null, CONFIG) &&
              post?.type &&
              !post?.type !== 'Page' &&
              post?.pageCover && (
                <div className='w-full relative md:flex-shrink-0 overflow-hidden'>
                  <LazyImage
                    alt={post.title}
                    src={post?.pageCover}
                    className='object-center w-full'
                  />
                </div>
              )}

            {/* Post title: font-bold, color #1b263b, hover #005577 */}
            <div className='text-center font-bold text-3xl text-[#1b263b] dark:text-white font-sans pt-6 hover:text-[#005577] transition-colors duration-200 cursor-default'>
              {siteConfig('POST_TITLE_ICON') && (
                <NotionIcon icon={post.pageIcon} />
              )}
              {post.title}
            </div>

            {/* Meta: category / date — color #778da9 (--steel) */}
            <section className='mt-2 text-[#778da9] dark:text-gray-400 font-light leading-7 text-sm'>
              <div className='flex flex-wrap justify-center'>
                {post?.type !== 'Page' && (
                  <>
                    <SmartLink
                      href={`/archive#${formatDateFmt(post?.publishDate, 'yyyy-MM')}`}
                      passHref
                      legacyBehavior>
                      <div className='pl-1 mr-2 cursor-pointer hover:text-[#005577] dark:hover:text-gray-200 border-b dark:border-gray-500 border-dashed'>
                        <i className='far fa-calendar mr-1' />{' '}
                        {post?.publishDay}
                      </div>
                    </SmartLink>
                    <span className='mr-2'>
                      {' '}| <i className='far fa-calendar-check mr-2' />
                      {post.lastEditedDay}{' '}
                    </span>
                    <div className='hidden busuanzi_container_page_uv font-light mr-2'>
                      <i className='mr-1 fas fa-user' />
                      <span className='mr-2 busuanzi_value_page_uv' />
                    </div>
                  </>
                )}
              </div>
              <WordCount wordCount={post.wordCount} readTime={post.readTime} />
            </section>
          </header>
        )}

        {/* Notion page body */}
        <article id='article-wrapper' className='mx-auto'>
          <WWAds className='w-full' orientation='horizontal' />
          {post && <NotionPage post={post} />}
          <WWAds className='w-full' orientation='horizontal' />
        </article>

        {showArticleInfo && (
          <>
            {/* Copyright */}
            {post?.type === 'Post' && (
              <ArticleCopyright author={siteConfig('AUTHOR')} url={url} />
            )}

            {/* Recommended posts */}
            {post?.type === 'Post' && (
              <RecommendPosts currentPost={post} recommendPosts={recommendPosts} />
            )}

            <section className='flex justify-between'>
              {/* Category — meta colour */}
              {post.category && (
                <div className='cursor-pointer my-auto text-md mr-2 text-[#778da9] hover:text-[#005577] dark:hover:text-white border-b dark:text-gray-500 border-dashed'>
                  <SmartLink href={`/category/${post.category}`} legacyBehavior>
                    <a>
                      <i className='mr-1 far fa-folder-open' />{' '}
                      {post.category}
                    </a>
                  </SmartLink>
                </div>
              )}

              {/* Tag pills */}
              {post?.type === 'Post' && (
                <>
                  {post.tagItems && (
                    <div className='flex items-center flex-nowrap leading-8 p-1 py-4 overflow-x-auto'>
                      <div className='hidden md:block dark:text-gray-300 whitespace-nowrap text-[#778da9]'>
                        {locale.COMMON.TAGS}:&nbsp;
                      </div>
                      {post.tagItems.map(tag => (
                        <TagItem key={tag.name} tag={tag} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Article Details button: teal bg, uppercase, font-semibold, square corners */}
            {post?.type === 'Post' && (
              <div className='flex justify-end mt-2 mb-6'>
                <SmartLink
                  href='#article-wrapper'
                  className='bg-[#005577] hover:bg-[#003f5a] text-white font-semibold uppercase tracking-[0.04em] rounded-none px-5 py-2.5 text-sm transition-colors duration-200'>
                  {locale.COMMON.ARTICLE_DETAIL}
                </SmartLink>
              </div>
            )}

            {post?.type === 'Post' && <BlogAround prev={prev} next={next} />}
          </>
        )}

        {/* Comments */}
        <div className='duration-200 w-full dark:border-gray-700 bg-white dark:bg-hexo-black-gray'>
          <Comment frontMatter={post} />
        </div>
      </div>
    </div>
  )
}
