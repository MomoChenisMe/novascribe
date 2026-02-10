import Link from 'next/link'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
}

export default function HeroSection({
  title = 'NovaScribe',
  subtitle = '發現更多精彩內容，探索知識的無限可能',
  ctaText = '開始閱讀',
  ctaLink = '/posts',
}: HeroSectionProps) {
  return (
    <section className="relative py-20 px-4 md:py-32 overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-transparent">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
          {title}
        </h1>
        
        <p className="text-lg md:text-xl text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
        
        <Link
          href={ctaLink}
          className="inline-block px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-all hover:scale-105 hover:shadow-lg"
        >
          {ctaText}
        </Link>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
    </section>
  )
}
