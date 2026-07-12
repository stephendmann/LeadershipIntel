import BLOG from '@/blog.config'
import useNotification from '@/components/Notification'
import TechGrow from '@/components/TechGrow'
import { siteConfig } from '@/lib/config'
import { resolvePostProps } from '@/lib/db/SiteDataApi'
import { useGlobal } from '@/lib/global'
import { getPageTableOfContents } from '@/lib/db/notion/getPageTableOfContents'
import {
  getPasswordQuery,
  getPasswordStoragePath,
  sha256Digest
} from '@/lib/utils/password'
import { checkSlugHasNoSlash } from '@/lib/utils/post'
import { DynamicLayout } from '@/themes/theme'
import md5 from 'js-md5'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { getStaticPathsBase } from '@/lib/build/staticPaths'
import { isExport } from '@/lib/utils/buildMode'

const isStaticExport = process.env.EXPORT === 'true'

/**
 * 根据notion的slug访问页面
 * 只解析一级目录例如 /about
 * @param {*} props
 * @returns
 */
const Slug = props => {
  const { post } = props
  const router = useRouter()
  const { locale } = useGlobal()

  // 文章锁🔐
  const [lock, setLock] = useState(post?.password && post?.password !== '')
  const { showNotification, Notification } = useNotification()

  /**
   * 解锁并记录本次解锁的SHA256摘要（不持久化明文密码）
   * @param {*} digest
   */
  const unlockWithDigest = digest => {
    setLock(false)
    // 键仅含 pathname，避免 query/hash 导致读写不一致（PR #3389）
    localStorage.setItem(
      'password_' + getPasswordStoragePath(router.asPath),
      digest
    )
    showNotification(locale.COMMON.ARTICLE_UNLOCK_TIPS) // 设置解锁成功提示显示
  }

  /**
   * 验证用户刚输入/URL中带来的明文密码
   * 兼容旧版 md5(slug+明文) 密码字段；成功后仅将SHA256摘要写入 localStorage
   * @param {*} passInput
   */
  const validPassword = passInput => {
    if (!post) {
      return false
    }
    const legacy = md5(String(post?.slug ?? '') + passInput)
    const nextHash = sha256Digest(passInput)
    if (nextHash === post?.password || legacy === post?.password) {
      unlockWithDigest(nextHash)
      return true
    }
    return false
  }

  /**
   * 用 localStorage 中保存的SHA256摘要直接与post.password比较（无需明文）
   * @param {*} digest
   */
  const validPasswordDigest = digest => {
    if (!post) {
      return false
    }
    if (digest === post?.password) {
      unlockWithDigest(digest)
      return true
    }
    return false
  }

  // 文章加载
  useEffect(() => {
    // 文章加密
    if (post?.password && post?.password !== '') {
      setLock(true)
    } else {
      setLock(false)
    }

    // 读取上次记录 自动提交密码/摘要
    const { rawPassword, storedDigests } = getPasswordQuery(router.asPath)
    if (!(rawPassword && validPassword(rawPassword))) {
      for (const digest of storedDigests) {
        if (validPasswordDigest(digest)) {
          break // 密码验证成功，停止尝试
        }
      }
    }
    // validPassword/validPasswordDigest 内部依赖 post / router 同时也已在依赖里
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, router.asPath])

  // 文章加载
  useEffect(() => {
    if (lock) {
      return
    }
    // 文章解锁后生成目录与内容
    if (post?.blockMap?.block) {
      post.content = Object.keys(post.blockMap.block).filter(
        key => post.blockMap.block[key]?.value?.parent_id === post.id
      )
      post.toc = getPageTableOfContents(post, post.blockMap)
    }
  }, [router, lock, post])

  props = { ...props, lock, validPassword }
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return (
    <>
      {/* 文章布局 */}
      <DynamicLayout theme={theme} layoutName='LayoutSlug' {...props} />
      {/* 解锁密码提示框 */}
      {post?.password && post?.password !== '' && !lock && <Notification />}
      {/* 导流工具 */}
      <TechGrow lock={lock} />
    </>
  )
}

Slug.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    slug: PropTypes.string,
    password: PropTypes.string,
    content: PropTypes.array,
    toc: PropTypes.array,
    blockMap: PropTypes.shape({
      block: PropTypes.object
    })
  }),
  NOTION_CONFIG: PropTypes.object
}

export async function getStaticPaths() {
  return getStaticPathsBase({
    from: 'slug-paths',
    filterFn: row => checkSlugHasNoSlash(row),
    mapPageToParams: row => ({ params: { prefix: row.slug } })
  })
}

export async function getStaticProps({ params: { prefix }, locale }) {
  const props = await resolvePostProps({
    prefix,
    locale,
  })

  return {
    props,
    revalidate: isStaticExport
      ? undefined
      : siteConfig(
        'NEXT_REVALIDATE_SECOND',
        BLOG.NEXT_REVALIDATE_SECOND,
        props.NOTION_CONFIG
      ),
    notFound: !props.post
  }
}

export default Slug
