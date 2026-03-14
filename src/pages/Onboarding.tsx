import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

export default function Onboarding() {
  const { t, language, setLanguage } = useLanguage();
  const [selectedStyle, setSelectedStyle] = useState('slow');
  const navigate = useNavigate();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  const travelStyles = [
    {
      id: 'slow',
      icon: 'spa',
      title: t('onboarding.slowTitle'),
      description: t('onboarding.slowDesc'),
    },
    {
      id: 'fast',
      icon: 'bolt',
      title: t('onboarding.fastTitle'),
      description: t('onboarding.fastDesc'),
    },
    {
      id: 'luxury',
      icon: 'diamond',
      title: t('onboarding.luxuryTitle'),
      description: t('onboarding.luxuryDesc'),
    },
    {
      id: 'budget',
      icon: 'backpack',
      title: t('onboarding.budgetTitle'),
      description: t('onboarding.budgetDesc'),
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto overflow-x-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 shadow-2xl border-x border-slate-200 dark:border-slate-800">
      <header className="flex items-center p-4 pb-2 justify-between">
        <Link 
          to="/"
          className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </Link>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">{t('onboarding.title')}</h2>
        <button 
          onClick={toggleLanguage}
          className="flex items-center justify-center rounded-full px-3 h-10 bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-bold text-sm"
        >
          {language === 'en' ? 'VI' : 'EN'}
        </button>
      </header>

      <div className="flex flex-col gap-3 p-6">
        <div className="flex gap-6 justify-between">
          <p className="text-primary font-bold text-sm uppercase tracking-wider">{t('onboarding.step')}</p>
        </div>
        <div className="rounded-full bg-primary/20 h-2 w-full overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: '40%' }}></div>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t('onboarding.defining')}</p>
      </div>

      <main className="flex-1 px-6">
        <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-extrabold leading-tight pb-2 pt-4">{t('onboarding.question')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-base pb-8">{t('onboarding.desc')}</p>

        <div className="grid grid-cols-1 gap-4 pb-24">
          {travelStyles.map((style) => {
            const isSelected = selectedStyle === style.id;
            return (
              <label 
                key={style.id}
                className={cn(
                  "group relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all active:scale-95 shadow-sm",
                  isSelected 
                    ? "border-primary bg-white dark:bg-slate-900" 
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50"
                )}
              >
                <input 
                  type="radio" 
                  name="style" 
                  className="hidden peer" 
                  checked={isSelected}
                  onChange={() => setSelectedStyle(style.id)}
                />
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-2xl">{style.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 dark:text-slate-100 text-base font-bold">{style.title}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">{style.description}</p>
                </div>
                {isSelected && (
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary text-white">
                    <span className="material-symbols-outlined text-sm">check</span>
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(`/app/explore?style=${selectedStyle}`)}
          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-5 bg-primary text-white text-base font-bold leading-normal tracking-wide shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
        >
          <span>{t('onboarding.continue')}</span>
        </button>
        <div className="h-2"></div>
      </footer>
    </div>
  );
}
