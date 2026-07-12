import { sha256 } from 'js-sha256'
import { isBrowser } from '.'

/** SHA256(hex)，用于文章锁新版存储（明文仅存在于 Notion，同步后为摘要） */
export const sha256Digest = str => sha256(String(str))

/** Notion 密码字段直接填入的预计算 SHA256（64 位 hex） */
export const isSHA256Digest = str =>
  typeof str === 'string' && /^[a-fA-F0-9]{64}$/.test(str.trim())

/** 旧版 md5(slug+明文) 的 32 位 hex，同步回字段时原样保留 */
export const isMd5Digest = str =>
  typeof str === 'string' && /^[a-fA-F0-9]{32}$/.test(str.trim())

/**
 * 与 getPasswordQuery 中 localStorage 键一致：pathname only，不含 ?query / #hash
 * （修复带查询参数或锚点时读写键不一致导致无法自动解锁，见 PR #3389）
 */
export const getPasswordStoragePath = path => {
  if (!path) {
    return '/'
  }
  try {
    const base =
      isBrowser && typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost'
    return new URL(path, base).pathname || '/'
  } catch {
    return String(path).split(/[?#]/)[0] || '/'
  }
}

/**
 * 获取密码校验所需数据
 * 用户可以通过url中拼接参数，输入密码
 * 明文密码仅用于当次校验，写回 localStorage 时只保存 SHA256 摘要，
 * 避免明文密码被持久化存储（CodeQL: clear text storage of sensitive information）
 * @returns {{rawPassword: string|null, storedDigests: string[]}}
 *   rawPassword: 本次请求带来的明文密码（如有），需要调用方hash后与post.password比较
 *   storedDigests: 历史记录中的SHA256摘要，可直接与post.password比较
 */
export const getPasswordQuery = path => {
  // 使用 URL 对象解析 URL
  const url = new URL(path, isBrowser ? window.location.origin : '')

  // 获取查询参数
  const queryParams = Object.fromEntries(url.searchParams.entries())

  // 请求中带着明文密码：仅存储其SHA256摘要，便于下次自动尝试
  if (queryParams.password) {
    localStorage.setItem('password_default', sha256Digest(queryParams.password))
  }

  // 获取路径部分
  const cleanedPath = url.pathname

  // 从 localStorage 中获取相关的密码摘要
  const storedDigest = localStorage.getItem('password_' + cleanedPath)
  const defaultDigest = localStorage.getItem('password_default')

  return {
    rawPassword: queryParams.password || null,
    storedDigests: [storedDigest, defaultDigest].filter(Boolean)
  }
}
