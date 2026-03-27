import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'

/**
   * Tag pill — matches stephendmann.com design:
   * teal bg/text/border, rounded-[4px], font-medium
   */
const TagItem = ({ tag, selected }) => {
    const { locale } = useGlobal()

    if (!tag) {
          return <div>{locale.COMMON.NOTAG}</div>
}

  return (
        <SmartLink
      href={selected ? '/' : `/tag/${encodeURIComponent(tag.name)}`}
      passHref
      legacyBehavior>
              <li
        className={`list-none cursor-pointer rounded-[4px] duration-200 mr-1 my-1 px-2 py-1 text-sm whitespace-nowrap font-medium
                  ${selected
                                ? 'text-white bg-[#005577] border border-[rgba(0,85,119,0.4)]'
                                : 'text-[#005577] bg-[rgba(0,85,119,0.08)] border border-[rgba(0,85,119,0.2)] hover:bg-[rgba(0,85,119,0.15)] dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                  }`}>
{selected && <i className='fas fa-tag mr-1' />}
{`${tag.name} `}
{tag.count ? `(${tag.count})` : ''}
</li>
  </SmartLink>
  )
}

export default TagItem
