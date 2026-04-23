import Header from "@/components/Header"
import UploadCard from "@/components/UploadCard"
import { Sparkles, Zap, Shield, Cpu } from "lucide-react"
import { useTranslations } from "next-intl"

export default function Home() {
  const t = useTranslations('Home');
  const tFeatures = useTranslations('Features');

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[20%] -right-20 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] -left-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Header />

      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-white/80">{t('badge')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            {t.rich('title', {
              highlight: (chunks) => <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-purple-400">{chunks}</span>
            })}
          </h1>

          <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {t('subtitle')}
          </p>

          <div className="pt-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <UploadCard />
          </div>
        </div>
      </section>

      <section id="features" className="py-24 border-t border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <FeatureCard 
            icon={<Zap className="text-yellow-400" />}
            title={tFeatures('instantInferenceTitle')}
            description={tFeatures('instantInferenceDesc')}
          />
          <FeatureCard 
            icon={<Cpu className="text-blue-400" />}
            title={tFeatures('stateOfArtTitle')}
            description={tFeatures('stateOfArtDesc')}
          />
          <FeatureCard 
            icon={<Shield className="text-green-400" />}
            title={tFeatures('secureStorageTitle')}
            description={tFeatures('secureStorageDesc')}
          />
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-white/20 text-sm">
        <p>{t('footer')}</p>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.02] space-y-4 hover:border-white/10 transition-colors group">
      <div className="p-3 w-fit rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white/90">{title}</h3>
      <p className="text-white/40 font-light leading-relaxed">{description}</p>
    </div>
  )
}
