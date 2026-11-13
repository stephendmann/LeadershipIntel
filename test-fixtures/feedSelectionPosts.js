/**
 * Feed-selection fixture: 8 eligible posts whose publish order and
 * last-edit order deliberately differ, plus posts that must never appear.
 */
const day = d => `2026-${d}`
const post = (n, publish, edited, extra = {}) => ({
  id: `id-${n}`,
  title: `Post ${n}`,
  slug: `article/post-${n}`,
  summary: `Summary ${n}`,
  type: 'Post',
  status: 'Published',
  publishDate: new Date(`${day(publish)}T00:00:00Z`).getTime(),
  publishDay: day(publish),
  lastEditedDate: `${day(edited)}T12:00:00.000Z`,
  date: { start_date: day(publish) },
  ...extra
})

// Published p1 (oldest) ... p8 (newest); edits shuffled.
const ELIGIBLE = [
  post(1, '01-01', '10-03'),
  post(2, '02-01', '10-07'),
  post(3, '03-01', '10-01'),
  post(4, '04-01', '10-08'),
  post(5, '05-01', '10-05'),
  post(6, '06-01', '10-06'),
  post(7, '07-01', '10-02'),
  post(8, '08-01', '10-04')
]

// Newest-edited first: p4 (10-08), p2, p6, p5, p8, p1, p7, p3 (10-01)
const EDIT_ORDER = ['4', '2', '6', '5', '8', '1', '7', '3']
// Newest-published first (the old /api/rss order): p8 ... p1
const PUBLISH_ORDER = ['8', '7', '6', '5', '4', '3', '2', '1']

// Must never be selected (and some are edited "newest" to tempt the sort).
const DISTRACTORS = [
  post('page', '09-01', '11-01', { type: 'Page' }),
  post('invisible', '09-02', '11-02', { status: 'Invisible' }),
  post('draft', '09-03', '11-03', { status: 'Draft' }),
  // Scheduled for the future: excluded while scheduled publishing is on.
  post('future', '09-04', '11-04', { date: { start_date: '2099-01-01' } }),
  // Publish window already closed.
  post('expired', '09-05', '11-05', {
    date: { start_date: '2020-01-01', end_date: '2020-12-31' }
  })
]

const urlFor = (link, n) => `${link}/article/post-${n}`

module.exports = { ELIGIBLE, DISTRACTORS, EDIT_ORDER, PUBLISH_ORDER, urlFor }
