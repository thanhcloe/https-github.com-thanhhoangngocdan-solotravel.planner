import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleGenAI, Type } from '@google/genai';

const popularDestinations = [
  { id: 'paris', en: 'Paris, France', vi: 'Paris, Pháp' },
  { id: 'tokyo', en: 'Tokyo, Japan', vi: 'Tokyo, Nhật Bản' },
  { id: 'bali', en: 'Bali, Indonesia', vi: 'Bali, Indonesia' },
  { id: 'newyork', en: 'New York, USA', vi: 'New York, Mỹ' },
  { id: 'london', en: 'London, UK', vi: 'Luân Đôn, Anh' },
  { id: 'rome', en: 'Rome, Italy', vi: 'Rome, Ý' },
  { id: 'bangkok', en: 'Bangkok, Thailand', vi: 'Bangkok, Thái Lan' },
  { id: 'seoul', en: 'Seoul, South Korea', vi: 'Seoul, Hàn Quốc' },
  { id: 'hanoi', en: 'Hanoi, Vietnam', vi: 'Hà Nội, Việt Nam' },
  { id: 'hcmc', en: 'Ho Chi Minh City, Vietnam', vi: 'TP. Hồ Chí Minh, Việt Nam' },
  { id: 'danang', en: 'Da Nang, Vietnam', vi: 'Đà Nẵng, Việt Nam' },
  { id: 'sydney', en: 'Sydney, Australia', vi: 'Sydney, Úc' },
  { id: 'dubai', en: 'Dubai, UAE', vi: 'Dubai, UAE' },
  { id: 'singapore', en: 'Singapore', vi: 'Singapore' },
  { id: 'barcelona', en: 'Barcelona, Spain', vi: 'Barcelona, Tây Ban Nha' },
];

export default function Explore() {
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const travelStyle = searchParams.get('style');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{en: string, vi: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [recommendations, setRecommendations] = useState<{
    inspirations: { name: string, region: string }[],
    bestTrips: { name: string, reason: string, rating: string, reviews: string }[]
  } | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!travelStyle) return;

    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Suggest travel destinations for a solo traveler with a "${travelStyle}" travel style. 
          Return a JSON object with two arrays:
          1. 'inspirations': 3 destinations with 'name' (e.g., "Kyoto, Japan") and 'region' (e.g., "Asia").
          2. 'bestTrips': 3 destinations with 'name' (e.g., "Agra, India"), 'reason' (short reason why it fits the style), 'rating' (e.g., "4.9"), and 'reviews' (e.g., "12k").
          Please respond in ${language === 'vi' ? 'Vietnamese' : 'English'}.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                inspirations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      region: { type: Type.STRING }
                    },
                    required: ["name", "region"]
                  }
                },
                bestTrips: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      reason: { type: Type.STRING },
                      rating: { type: Type.STRING },
                      reviews: { type: Type.STRING }
                    },
                    required: ["name", "reason", "rating", "reviews"]
                  }
                }
              },
              required: ["inspirations", "bestTrips"]
            }
          }
        });
        
        if (response.text) {
          const parsed = JSON.parse(response.text);
          setRecommendations(parsed);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [travelStyle, language]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    if (!destination.trim()) {
      setAiSuggestions([]);
      setIsSearching(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearching(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Suggest 5 travel destinations matching or related to "${destination}". Return a JSON array of objects with 'en' (English name, e.g., "Paris, France") and 'vi' (Vietnamese name, e.g., "Paris, Pháp") properties.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING },
                  vi: { type: Type.STRING }
                },
                required: ["en", "vi"]
              }
            }
          }
        });
        
        if (response.text) {
          const parsed = JSON.parse(response.text);
          setAiSuggestions(parsed);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [destination]);

  const filteredDestinations = destination.trim() 
    ? aiSuggestions 
    : popularDestinations;

  const handleSelectDestination = (destName: string) => {
    setDestination(destName);
    setShowSuggestions(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination) {
      navigate(`/app/itinerary?destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };
  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <header className="flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-40 p-4 justify-between">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <span className="material-symbols-outlined text-primary">person_pin_circle</span>
        </div>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">{t('explore.title')}</h2>
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={toggleLanguage}
            className="flex items-center justify-center rounded-full px-3 h-10 bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-bold text-sm"
          >
            {language === 'en' ? 'VI' : 'EN'}
          </button>
          <button className="flex items-center justify-center rounded-full size-10 bg-slate-200/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* Search Bar & Calendar */}
      <div className="px-4 py-4">
        <form onSubmit={handleSearch} className="flex flex-col gap-3">
          <div ref={wrapperRef} className="relative w-full">
            <label className="flex flex-col min-w-40 h-14 w-full">
              <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
                <div className="text-slate-500 dark:text-slate-400 flex border-none bg-white dark:bg-slate-800 items-center justify-center pl-4 rounded-l-xl border-r-0">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input 
                  type="text"
                  value={destination}
                  onChange={(e) => {
                    setDestination(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-0 border-none bg-white dark:bg-slate-800 focus:border-none h-full placeholder:text-slate-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-medium" 
                  placeholder={t('explore.searchPlaceholder')} 
                  autoComplete="off"
                />
              </div>
            </label>
            
            {showSuggestions && (destination.length === 0 || filteredDestinations.length > 0 || isSearching) && (
              <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="px-4 py-4 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                    <span className="text-sm font-medium">{language === 'en' ? 'Finding destinations...' : 'Đang tìm điểm đến...'}</span>
                  </div>
                ) : (
                  filteredDestinations.map((dest, index) => (
                    <div 
                      key={dest.en + index}
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-900 dark:text-slate-100 border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                      onClick={() => handleSelectDestination(dest[language as 'en' | 'vi'])}
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400">location_on</span>
                        <span className="font-medium">{dest[language as 'en' | 'vi']}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <label className="flex flex-col flex-1 h-14">
              <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
                <div className="text-slate-500 dark:text-slate-400 flex border-none bg-white dark:bg-slate-800 items-center justify-center pl-4 rounded-l-xl border-r-0">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-slate-100 focus:outline-0 focus:ring-0 border-none bg-white dark:bg-slate-800 focus:border-none h-full placeholder:text-slate-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-medium" 
                  placeholder={t('explore.datePlaceholder')}
                />
              </div>
            </label>
            <button 
              type="submit"
              className="h-14 px-6 bg-primary text-white font-bold rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Trip Planner Card */}
      <div className="px-4 py-2">
        <div className="relative overflow-hidden flex flex-col items-stretch justify-start rounded-xl shadow-lg bg-primary text-white p-6">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-extrabold leading-tight tracking-tight mb-2">{t('explore.quickPlanner')}</h3>
            <p className="text-white/80 text-sm mb-6 font-medium">{t('explore.quickPlannerDesc')}</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">schedule</span> {t('explore.days')}
              </div>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">payments</span> {t('explore.budget')}
              </div>
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">calendar_month</span> {t('explore.month')}
              </div>
            </div>
            
            <Link to="/app/itinerary" className="w-full flex items-center justify-center rounded-xl h-12 bg-white text-primary font-bold text-base transition-transform active:scale-95 shadow-md">
              {t('explore.startPlanning')}
            </Link>
          </div>
        </div>
      </div>

      {/* Destination Inspiration */}
      <div className="py-6">
        <div className="flex items-center justify-between px-4 mb-4">
          <h3 className="text-slate-900 dark:text-slate-100 text-xl font-extrabold tracking-tight">{t('explore.dailyInspiration')}</h3>
          <button className="text-primary text-sm font-bold">{t('explore.viewAll')}</button>
        </div>
        <div className="flex overflow-x-auto gap-4 px-4 no-scrollbar pb-4">
          {isLoadingRecommendations ? (
            <div className="flex items-center justify-center w-full py-10">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
            </div>
          ) : recommendations ? (
            recommendations.inspirations.map((item, idx) => (
              <div key={idx} className="flex-none w-64 cursor-pointer" onClick={() => navigate(`/app/destination-details?name=${encodeURIComponent(item.name)}`)}>
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-md group">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: `url("https://image.pollinations.ai/prompt/${encodeURIComponent('Beautiful travel photography of ' + item.name + ', landmark, highly detailed')}?width=800&height=1000&nologo=true")` }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 p-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/70">{item.region}</p>
                    <h4 className="text-lg font-bold">{item.name}</h4>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              {/* Card 1 */}
              <div className="flex-none w-64 cursor-pointer" onClick={() => navigate('/app/destination-details?name=Venice,%20Italy')}>
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-md group">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=2070&auto=format&fit=crop")' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 p-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/70">Europe</p>
                    <h4 className="text-lg font-bold">Venice, Italy</h4>
                  </div>
                </div>
              </div>
              {/* Card 2 */}
              <div className="flex-none w-64 cursor-pointer" onClick={() => navigate('/app/destination-details?name=Kyoto,%20Japan')}>
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-md group">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop")' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 p-4 text-white">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/70">Asia</p>
                    <h4 className="text-lg font-bold">Kyoto, Japan</h4>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Best Solo Trips This Month */}
      <div className="px-4 py-4">
        <h3 className="text-slate-900 dark:text-slate-100 text-xl font-extrabold tracking-tight mb-4">{t('explore.bestTrips')}</h3>
        <div className="space-y-4">
          {isLoadingRecommendations ? (
            <div className="flex items-center justify-center w-full py-10">
              <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
            </div>
          ) : recommendations ? (
            recommendations.bestTrips.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(`/app/destination-details?name=${encodeURIComponent(item.name)}`)}
                className="flex gap-4 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm items-center border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="size-20 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: `url("https://image.pollinations.ai/prompt/${encodeURIComponent('Beautiful travel photography of ' + item.name + ', landmark, highly detailed')}?width=200&height=200&nologo=true")` }}></div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.reason}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-amber-400 text-sm filled">star</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.rating} ({item.reviews})</span>
                  </div>
                </div>
                <div className="text-primary pr-2">
                  <span className="material-symbols-outlined">arrow_forward_ios</span>
                </div>
              </div>
            ))
          ) : (
            <>
              <div 
                onClick={() => navigate('/app/destination-details?name=Agra,%20India')}
                className="flex gap-4 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm items-center border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="size-20 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2076&auto=format&fit=crop")' }}></div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Agra, India</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Perfect for culture seekers</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-amber-400 text-sm filled">star</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">4.9 (12k)</span>
                  </div>
                </div>
                <div className="text-primary pr-2">
                  <span className="material-symbols-outlined">arrow_forward_ios</span>
                </div>
              </div>

              <div 
                onClick={() => navigate('/app/destination-details?name=Cinque%20Terre,%20Italy')}
                className="flex gap-4 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm items-center border border-slate-100 dark:border-slate-700 cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className="size-20 rounded-lg bg-cover bg-center shrink-0" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1499678329028-101435549a4e?q=80&w=2070&auto=format&fit=crop")' }}></div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">Cinque Terre, Italy</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Great for coastal hiking</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-amber-400 text-sm filled">star</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">4.8 (8k)</span>
                  </div>
                </div>
                <div className="text-primary pr-2">
                  <span className="material-symbols-outlined">arrow_forward_ios</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
