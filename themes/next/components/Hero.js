import { siteConfig } from '@/lib/config'
import CONFIG from '../config'

/**
 * Full-width hero - desktop only.
 *
 * Default: extracted verbatim from LayoutBase (index.js).
 * Variant: category-scoped masthead experiment (Stephen Mann banner
 * direction) gated by NEXT_AI_HERO_CATEGORY — renders only when the
 * current category matches that string exactly; empty string = off.
 */
const Hero = props => {
  const { category } = props
  const expCategory = siteConfig('NEXT_AI_HERO_CATEGORY', '', CONFIG)
  if (expCategory && category === expCategory) {
    return <CategoryMasthead category={category} />
  }
  return <DefaultHero />
}

const DefaultHero = () => {
  const heroBg = '/blog-header.png'
  return (
    <div
      className='hidden lg:flex w-full relative items-center justify-center border-b border-[rgba(0,85,119,0.12)]'
      style={{
        minHeight: '220px',
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
      {/* Dark overlay so title stays legible over any image */}
      <div className='absolute inset-0 bg-[#1b263b]/60 dark:bg-black/70' />
      <div className='relative z-10 flex flex-col items-center px-8'>
        <h1 className='font-sans text-5xl font-bold text-white leading-tight tracking-tight text-center drop-shadow-lg'>
          {siteConfig('TITLE')}
        </h1>
        {siteConfig('BIO') && (
          <p className='mt-3 font-sans text-lg text-white/90 text-center max-w-2xl drop-shadow-lg'>
            {siteConfig('BIO')}
          </p>
        )}
      </div>
    </div>
  )
}

const CategoryMasthead = ({ category }) => {
  return (
    <div
      className='hidden lg:flex w-full relative items-center justify-center bg-[#1b263b] border-b-2 border-[#005577]'
      style={{ minHeight: '220px' }}>
      <div className='relative z-10 flex flex-col items-center px-8 py-10'>
        {/* Interlocked-S brand mark, reversed variant for dark background
            (the primary teal/navy mark loses its navy half on this panel).
            Decorative only, the H1 below carries the text */}
        <img
          src='/images/interlocked-s-reverse.png'
          alt=''
          aria-hidden='true'
          className='w-12 h-12 mb-4 object-contain'
        />
        {/* Inline fontFamily is deliberate: it must beat the global
            "#theme-next h1 { font-family: Inter }" rule in style.js */}
        <h1
          className='text-5xl font-bold text-white text-center tracking-tight leading-tight'
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          {category}
        </h1>
        <p
          className='mt-4 text-lg text-[#c7d2e0] text-center italic'
          style={{ fontFamily: "'Merriweather', Georgia, serif" }}>
          Automate everything but judgment.
        </p>
      </div>
    </div>
  )
}

export default Hero
