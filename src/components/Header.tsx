import { Sparkles, Github } from "lucide-react"
import Link from "next/link"

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-lg bg-white text-black group-hover:scale-110 transition-transform">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">VisionApp</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Features</Link>
          <Link href="#about" className="text-sm font-medium text-white/60 hover:text-white transition-colors">How it works</Link>
          <a 
            href="https://github.com/alexi" 
            target="_blank" 
            rel="noreferrer"
            className="p-2 rounded-full border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <Github size={20} />
          </a>
        </nav>
      </div>
    </header>
  )
}
