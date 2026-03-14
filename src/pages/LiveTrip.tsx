import { useNavigate } from 'react-router-dom';

export default function LiveTrip() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-20">
        <div className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start cursor-pointer">
          <span className="material-symbols-outlined">arrow_back</span>
        </div>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">Live Trip</h2>
          <p className="text-primary text-xs font-semibold uppercase tracking-wider">Paris, France</p>
        </div>
        <div className="flex w-12 items-center justify-end gap-2">
          <button 
            onClick={() => navigate('/app/journal')}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <span className="material-symbols-outlined text-[20px]">book</span>
          </button>
          <button className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
        </div>
      </div>

      {/* Weather Alert Banner */}
      <div className="p-4 pt-2">
        <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 backdrop-blur-sm border-l-4 border-l-primary">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
              <span className="material-symbols-outlined">rainy</span>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-slate-900 dark:text-slate-100 text-base font-bold leading-tight">Weather Alert</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm font-normal leading-normal">Expect light rain in 20 mins. Don't forget your umbrella!</p>
            </div>
          </div>
          <button className="text-sm font-bold leading-normal tracking-wide flex items-center gap-2 text-primary self-end hover:underline">
            View Details
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Main Schedule Card */}
      <div className="px-4 py-2">
        <h3 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight mb-3">Next Up</h3>
        <div className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
          <div 
            className="w-full h-48 bg-center bg-no-repeat bg-cover relative" 
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=1887&auto=format&fit=crop")' }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-4 left-4">
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Confirmed</span>
            </div>
          </div>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <p className="text-primary text-xs font-bold uppercase tracking-wider">Activity</p>
                <h4 className="text-slate-900 dark:text-slate-100 text-lg font-bold">Visit Eiffel Tower</h4>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>10:00 AM - 12:30 PM</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-900 dark:text-slate-100 font-bold">€25.00</p>
                <p className="text-slate-500 text-xs">per person</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex cursor-pointer items-center justify-center rounded-lg h-10 bg-primary text-white gap-2 text-sm font-bold hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined text-[18px]">navigation</span>
                Get Directions
              </button>
              <button className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Big CTA Button */}
      <div className="px-4 py-6">
        <button className="w-full flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-[#439cf5] p-6 text-white shadow-lg shadow-primary/20 hover:scale-[0.98] transition-transform">
          <span className="material-symbols-outlined text-3xl">explore</span>
          <span className="text-lg font-bold">What should I do now?</span>
          <span className="text-sm opacity-80 font-medium tracking-wide">AI-powered suggestions based on your mood</span>
        </button>
      </div>

      {/* Nearby Suggestions Carousel */}
      <div className="py-2">
        <div className="flex items-center justify-between px-4 mb-3">
          <h3 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight">Nearby Gems</h3>
          <button className="text-primary text-sm font-bold">See all</button>
        </div>
        <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar">
          {/* Suggestion 1 */}
          <div className="flex-none w-48 group cursor-pointer">
            <div className="relative h-32 w-full mb-2 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
              <div 
                className="absolute inset-0 bg-center bg-cover transition-transform group-hover:scale-110" 
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop")' }}
              ></div>
              <div className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-white/80 backdrop-blur text-primary">
                <span className="material-symbols-outlined text-[16px] filled">favorite</span>
              </div>
            </div>
            <p className="text-slate-900 dark:text-slate-100 text-sm font-bold truncate">Le Petit Bistro</p>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
              <span className="material-symbols-outlined text-[12px] text-yellow-500 filled">star</span>
              <span>4.8 • 200m away</span>
            </div>
          </div>

          {/* Suggestion 2 */}
          <div className="flex-none w-48 group cursor-pointer">
            <div className="relative h-32 w-full mb-2 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
              <div 
                className="absolute inset-0 bg-center bg-cover transition-transform group-hover:scale-110" 
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop")' }}
              ></div>
              <div className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-white/80 backdrop-blur text-primary">
                <span className="material-symbols-outlined text-[16px]">favorite</span>
              </div>
            </div>
            <p className="text-slate-900 dark:text-slate-100 text-sm font-bold truncate">Seine River Walk</p>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
              <span className="material-symbols-outlined text-[12px] text-yellow-500 filled">star</span>
              <span>4.9 • 450m away</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
