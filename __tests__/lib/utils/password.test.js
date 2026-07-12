import { sha256 } from 'js-sha256'
import {
  sha256Digest,
  getPasswordQuery,
  getPasswordStoragePath
} from '@/lib/utils/password'

describe('password utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('computes the sha256 digest of a plaintext password', () => {
    expect(sha256Digest('hunter2')).toBe(sha256('hunter2'))
  })

  it('resolves a storage path from pathname only, dropping query/hash', () => {
    expect(getPasswordStoragePath('/post/a?password=x#frag')).toBe('/post/a')
    expect(getPasswordStoragePath('/post/a')).toBe('/post/a')
    expect(getPasswordStoragePath('')).toBe('/')
  })

  it('stores only a SHA256 digest of a query-param password, never the plaintext', () => {
    const result = getPasswordQuery('/post/a?password=hunter2')

    expect(result.rawPassword).toBe('hunter2')
    expect(localStorage.getItem('password_default')).toBe(sha256('hunter2'))
    expect(localStorage.getItem('password_default')).not.toBe('hunter2')
  })

  it('returns previously stored digests for auto-retry, not plaintext', () => {
    localStorage.setItem('password_/post/a', sha256('storedpass'))

    const result = getPasswordQuery('/post/a')

    expect(result.rawPassword).toBe(null)
    expect(result.storedDigests).toContain(sha256('storedpass'))
  })
})
