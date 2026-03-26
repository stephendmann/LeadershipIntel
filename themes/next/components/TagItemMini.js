import SmartLink from '@/components/SmartLink'

const TagItemMini = ({ tag, selected = false }) => {
  return (
    <SmartLink
      key={tag}
      href={selected ? '/' : `/tag/${encodeURIComponent(tag.name)}`}
      passHref
      className={`cursor-pointer inline-block rounded-[4px] duration-200
        mr-2 py-0.5 px-1.5 text-[12px] whitespace-nowrap
         ${selected
        ? 'text-white bg-[#005577] border border-[rgba(0,85,119,0.4)]'
        : 'text-[#005577] bg-[rgba(0,85,119,0.08)] border border-[rgba(0,85,119,0.2)] hover:bg-[rgba(0,85,119,0.15)] dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'}` }>

      <div className='font-medium'>{selected && <i className='fas fa-tag mr-1'/>} {tag.name + (tag.count ? `(${tag.count})` : '')} </div>

    </SmartLink>
  );
}

export default TagItemMini
