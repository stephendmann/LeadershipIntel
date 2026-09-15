/**
 * Guard against caching empty/invalid site data.
 *
 * When Notion is unreachable, convertNotionToSiteData short-circuits to `{}`.
 * Before this guard the cache manager treated `{}` as truthy and stored it,
 * pinning a blank site for the whole revalidation window.
 *
 * The redis backend is mocked out here because lib/cache/redis_cache imports
 * lib/config -> lib/global -> @clerk/nextjs, whose ESM build Jest cannot parse
 * (tracked separately in issue #79). Mocking it keeps this suite runnable
 * without touching the shared Jest config.
 */

const makeBackend = () => ({
  getCache: jest.fn(async () => null),
  setCache: jest.fn(async () => undefined),
  delCache: jest.fn(async () => undefined)
})

const redisBackend = makeBackend()
const fileBackend = makeBackend()
const memoryBackend = makeBackend()

jest.mock('@/lib/cache/redis_cache', () => ({
  __esModule: true,
  default: redisBackend,
  ...redisBackend
}))
jest.mock('@/lib/cache/local_file_cache', () => ({
  __esModule: true,
  default: fileBackend,
  ...fileBackend
}))
jest.mock('@/lib/cache/memory_cache', () => ({
  __esModule: true,
  default: memoryBackend,
  ...memoryBackend
}))

const {
  getOrSetDataWithCache,
  setDataToCache,
  getDataFromCache
} = require('@/lib/cache/cache_manager')

const writeBackends = [redisBackend, fileBackend, memoryBackend]
const setCalls = () =>
  writeBackends.reduce((total, backend) => total + backend.setCache.mock.calls.length, 0)

beforeEach(() => {
  writeBackends.forEach(backend => {
    backend.getCache.mockReset().mockResolvedValue(null)
    backend.setCache.mockReset().mockResolvedValue(undefined)
    backend.delCache.mockReset().mockResolvedValue(undefined)
  })
})

describe('cache_manager: empty results are not cached', () => {
  it('does not cache an empty object returned by a failed fetch', async () => {
    const result = await getOrSetDataWithCache('site_empty', async () => ({}))

    expect(setCalls()).toBe(0)
    // The caller still gets the degraded payload; only caching is skipped.
    expect(result).toEqual({})
  })

  it('does not cache an empty array', async () => {
    await getOrSetDataWithCache('list_empty', async () => [])

    expect(setCalls()).toBe(0)
  })

  it('does not cache null or undefined', async () => {
    await getOrSetDataWithCache('null_result', async () => null)
    await getOrSetDataWithCache('undefined_result', async () => undefined)

    expect(setCalls()).toBe(0)
  })

  it('re-runs the fetcher on the next call instead of serving a cached blank', async () => {
    const fetcher = jest.fn(async () => ({}))

    await getOrSetDataWithCache('site_retry', fetcher)
    await getOrSetDataWithCache('site_retry', fetcher)

    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(setCalls()).toBe(0)
  })
})

describe('cache_manager: valid results still cache normally', () => {
  it('caches a populated object', async () => {
    const siteData = { allPages: [{ id: 'a' }], tagOptions: [] }
    const result = await getOrSetDataWithCache('site_ok', async () => siteData)

    expect(setCalls()).toBeGreaterThan(0)
    expect(result).toEqual(siteData)
  })

  it('caches a populated array', async () => {
    await getOrSetDataWithCache('list_ok', async () => [1, 2, 3])

    expect(setCalls()).toBeGreaterThan(0)
  })

  it('caches non-plain objects such as Date without treating them as empty', async () => {
    await setDataToCache('date_value', new Date('2026-09-15T00:00:00Z'))

    expect(setCalls()).toBeGreaterThan(0)
  })
})

describe('cache_manager: setDataToCache guard', () => {
  it('ignores a direct write of an empty object', async () => {
    await setDataToCache('direct_empty', {})

    expect(setCalls()).toBe(0)
  })

  it('performs a direct write of populated data', async () => {
    await setDataToCache('direct_ok', { summary: 'text' })

    expect(setCalls()).toBeGreaterThan(0)
  })
})

describe('cache_manager: read path', () => {
  it('treats a previously stored empty object as a miss', async () => {
    writeBackends.forEach(backend => backend.getCache.mockResolvedValue({}))

    // `force` bypasses ENABLE_CACHE, which is off under NODE_ENV=test.
    await expect(getDataFromCache('poisoned_key', true)).resolves.toBeNull()
  })

  it('returns populated cached data', async () => {
    const cached = { allPages: [{ id: 'a' }] }
    memoryBackend.getCache.mockResolvedValue(cached)
    fileBackend.getCache.mockResolvedValue(cached)

    await expect(getDataFromCache('good_key', true)).resolves.toEqual(cached)
  })
})
