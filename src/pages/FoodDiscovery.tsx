import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function FoodDiscovery() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const foods = [
    {
      id: 1,
      name: 'Trofie al Pesto',
      desc: 'Local pasta with fresh basil pesto, potatoes, and green beans.',
      image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=2070&auto=format&fit=crop',
      match: '98%'
    },
    {
      id: 2,
      name: 'Fritto Misto',
      desc: 'Mixed fried seafood caught fresh daily from the Ligurian sea.',
      image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=2070&auto=format&fit=crop',
      match: '95%'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-24 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="flex items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 sticky top-0 z-20 border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => navigate(-1)}
          className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-slate-100">
          {t('food.title')}
        </h1>
        <div className="size-10"></div> {/* Spacer for centering */}
      </div>

      <div className="p-4 space-y-6">
        <p className="text-slate-600 dark:text-slate-400">
          {t('food.highlights')}
        </p>

        <div className="space-y-4">
          {foods.map((food) => (
            <div key={food.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
              <div 
                className="h-40 w-full bg-cover bg-center relative"
                style={{ backgroundImage: `url("${food.image}")` }}
              >
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                  {food.match} Match
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{food.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{food.desc}</p>
                <button className="w-full py-2 bg-primary/10 text-primary font-bold rounded-lg text-sm hover:bg-primary/20 transition-colors">
                  Find Places to Eat
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
