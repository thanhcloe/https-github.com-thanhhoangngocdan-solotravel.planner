import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Splash() {
  const { t, language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  return (
    <div className="relative min-h-screen w-full max-w-md mx-auto overflow-hidden flex flex-col items-center justify-center bg-slate-900">
      {/* Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-center bg-no-repeat bg-cover transform scale-105" 
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop")' }}
        ></div>
        {/* Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-slate-900/20"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full px-6 flex flex-col items-center text-center">
        {/* Branding/Logo Placeholder */}
        <div className="mb-12 flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <span className="material-symbols-outlined text-white text-3xl">explore</span>
          </div>
          <span className="text-white text-2xl font-extrabold tracking-tight">SOLO<span className="text-primary">PATH</span></span>
        </div>

        {/* Hero Section Components */}
        <div className="w-full">
          <div className="space-y-6">
            <h1 className="text-white tracking-tight text-4xl sm:text-5xl font-extrabold leading-[1.1]">
              {t('splash.title1')}<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-300">{t('splash.title2')}</span> {t('splash.title3')}
            </h1>
            <p className="text-slate-300 text-lg font-medium max-w-md mx-auto leading-relaxed">
              {t('splash.subtitle')}
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-4 w-full max-w-xs mx-auto">
            <Link 
              to="/onboarding"
              className="flex min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary text-white text-lg font-bold leading-normal tracking-wide shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95"
            >
              <span className="truncate">{t('splash.startPlanning')}</span>
              <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
            </Link>
            <Link 
              to="/app/explore"
              className="text-slate-300 text-base font-semibold leading-normal py-3 flex items-center justify-center gap-1 hover:text-white transition-colors group"
            >
              <span className="border-b border-slate-300/30 group-hover:border-white/60">{t('splash.exploreFirst')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Stats/Features - Minimalist style */}
      <div className="absolute bottom-8 left-0 right-0 z-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8 sm:gap-16 opacity-80">
          <div className="flex flex-col items-center">
            <span className="text-white text-xl font-bold">50k+</span>
            <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold">{t('splash.routes')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white text-xl font-bold">120+</span>
            <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold">{t('splash.countries')}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white text-xl font-bold">4.9/5</span>
            <span className="text-slate-400 text-xs uppercase tracking-widest font-semibold">{t('splash.rating')}</span>
          </div>
        </div>
      </div>

      {/* Subtle Top Navigation glass effect */}
      <div className="absolute top-0 left-0 right-0 z-20 px-6 py-6 flex justify-between items-center bg-gradient-to-b from-black/20 to-transparent">
        <div className="hidden sm:flex items-center gap-6">
          <a className="text-white/70 hover:text-white text-sm font-medium" href="#">{t('splash.destinations')}</a>
          <a className="text-white/70 hover:text-white text-sm font-medium" href="#">{t('splash.safetyGuide')}</a>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <button 
            onClick={toggleLanguage}
            className="text-white/90 text-sm font-bold px-3 py-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">language</span>
            {language === 'en' ? 'VI' : 'EN'}
          </button>
          <button className="text-white/90 text-sm font-bold px-4 py-2 hover:bg-white/10 rounded-lg transition-colors">{t('splash.login')}</button>
        </div>
      </div>
    </div>
  );
}
