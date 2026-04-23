import { Sparkles, Globe } from "lucide-react"
import { Link } from "@/i18n/routing"
import { useTranslations, useLocale } from "next-intl"

export default function Header() {
  const t = useTranslations('Header');
  const locale = useLocale();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-white text-black group-hover:scale-110 transition-transform">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">{t('title')}</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-white/60 hover:text-white transition-colors">{t('features')}</Link>
          <div className="flex items-center gap-2 ml-4">
            <Link href="/" locale="en" className={`text-xs font-medium px-2 py-1 rounded-md border transition-colors ${locale === 'en' ? 'text-black bg-white border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-white/60 border-white/10 hover:text-white hover:bg-white/10'}`}>EN</Link>
            <Link href="/" locale="uk" className={`text-xs font-medium px-2 py-1 rounded-md border transition-colors ${locale === 'uk' ? 'text-black bg-white border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-white/60 border-white/10 hover:text-white hover:bg-white/10'}`}>UK</Link>
          </div>
          <a 
            href="https://github.com/alexi" 
            target="_blank" 
            rel="noreferrer"
            className="p-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all ml-2"
          >
            <Globe size={20} />
          </a>
        </nav>
      </div>
    </header>
  )
}
