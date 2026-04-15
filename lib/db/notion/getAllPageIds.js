import BLOG from "@/blog.config"

export default function getAllPageIds(collectionQuery, collectionId, collectionView, viewIds, block = {}) {
  const pageSet = new Set()

  // Strategy 1: page_sort (ordered, but may be truncated)
  if (collectionView && viewIds?.length > 0) {
    const groupIndex = BLOG.NOTION_INDEX || 0
    const targetViewId = viewIds[groupIndex]
    const pageSort = collectionView?.[targetViewId]?.value?.value?.page_sort
    if (Array.isArray(pageSort) && pageSort.length > 0) {
      pageSort.forEach(id => pageSet.add(id))
    }
  }

  // Strategy 2: collectionQuery always runs, supplements page_sort truncated records
  // Note: supplementary records are appended at the end, preserving existing order
  if (collectionQuery && collectionId) {
    const viewQuery = collectionQuery?.[collectionId]
    if (viewQuery) {
      Object.values(viewQuery).forEach(viewData => {
        [
          viewData?.collection_group_results?.blockIds,
          viewData?.results?.blockIds,
          viewData?.blockIds,
        ].forEach(ids => {
          if (Array.isArray(ids)) ids.forEach(id => pageSet.add(id))
        })
      })
    }
  }

  return [...pageSet]
}
