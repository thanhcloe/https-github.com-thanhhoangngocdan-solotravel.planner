import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

export default function TripRecap() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const destination = searchParams.get('destination') || 'Paris';
  const date = searchParams.get('date') || 'Oct 10 - Oct 15, 2023';
  const duration = searchParams.get('duration') || '5';
  
  const itemsString = searchParams.get('items');
  let items: any[] = [];
  try {
    if (itemsString) {
      items = JSON.parse(decodeURIComponent(itemsString));
    }
  } catch (e) {
    console.error("Failed to parse items", e);
  }

  const placesCount = items.length;
  const foodCount = items.filter(i => i.type === 'food').length;
  const activityCount = items.filter(i => i.type === 'activity').length;
  const transportCount = items.filter(i => i.type === 'transport').length;
  const accommodationCount = items.filter(i => i.type === 'accommodation').length;
  
  // Calculate total spent
  let totalSpent = 0;
  let currency = '€';
  items.forEach(item => {
    if (item.cost && item.cost !== 'Free') {
      const match = item.cost.match(/[\d,.]+/);
      if (match) {
        totalSpent += parseFloat(match[0].replace(/,/g, ''));
      }
      if (item.cost.includes('$')) currency = '$';
      else if (item.cost.includes('VNĐ') || item.cost.includes('VND')) currency = 'VNĐ';
      else if (item.cost.includes('¥')) currency = '¥';
    }
  });

  // Estimate km explored (roughly 1.5km per place)
  const kmExplored = Math.round(placesCount * 1.5 * 10) / 10;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [regionName, setRegionName] = useState<string>('');

  useEffect(() => {
    const fetchRegionAndImage = async () => {
      setIsGeneratingImage(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        
        // Fetch region name
        const regionResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `What is the general region or continent for "${destination}"? Return ONLY the region name (e.g., "Eastern Asia", "Western Europe", "North America"). Do not include any other text.`,
        });
        const region = regionResponse.text?.trim() || 'Global';
        setRegionName(region);

        // Fetch image
        const imgResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              {
                text: `A beautiful, realistic, high-quality travel photography shot of ${destination}. Scenic, authentic, real-world photo.`,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9",
              imageSize: "1K"
            },
          },
        });
        
        if (imgResponse.candidates && imgResponse.candidates[0] && imgResponse.candidates[0].content.parts) {
          for (const part of imgResponse.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64EncodeString = part.inlineData.data;
              setImageUrl(`data:image/png;base64,${base64EncodeString}`);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsGeneratingImage(false);
      }
    };

    fetchRegionAndImage();
  }, [destination]);

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
          {regionName ? `${regionName} Adventure Recap` : t('recap.title')}
        </h1>
        <div className="size-10"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Hero Stats */}
        <div className="bg-gradient-to-br from-primary to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden min-h-[200px] flex flex-col justify-end">
          {imageUrl && (
            <div className="absolute inset-0 z-0">
              <img src={imageUrl} alt={destination} className="w-full h-full object-cover opacity-60 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>
          )}
          {isGeneratingImage && !imageUrl && (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-black/20">
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-white/70">refresh</span>
                <span className="text-xs text-white/70 font-medium">Generating illustration...</span>
              </div>
            </div>
          )}
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl z-0"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-extrabold mb-1">{destination} Adventure</h2>
            <p className="text-white/80 text-sm mb-6">{date}</p>
            
            <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col">
              <span className="text-3xl font-black">{duration}</span>
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Days</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black">{placesCount}</span>
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">Places</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black">{kmExplored}</span>
              <span className="text-xs font-medium text-white/80 uppercase tracking-wider">km Explored</span>
            </div>
          </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">{t('recap.details')}</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Total Spent</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Estimated cost</p>
              </div>
              <div className="text-right font-bold text-slate-900 dark:text-slate-100">
                {currency === 'VNĐ' ? `${totalSpent.toLocaleString()} ${currency}` : `${currency}${totalSpent.toLocaleString()}`}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex size-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
                <span className="material-symbols-outlined">restaurant</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Total Cuisine</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Food & Dining</p>
              </div>
              <div className="text-right font-bold text-slate-900 dark:text-slate-100">
                {foodCount} meals
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                <span className="material-symbols-outlined">local_activity</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Total Activities</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Attractions & Tours</p>
              </div>
              <div className="text-right font-bold text-slate-900 dark:text-slate-100">
                {activityCount} places
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <span className="material-symbols-outlined">directions_bus</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Total Transportation</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Transit & Travel</p>
              </div>
              <div className="text-right font-bold text-slate-900 dark:text-slate-100">
                {transportCount} trips
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex size-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <span className="material-symbols-outlined">hotel</span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Total Accommodation</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Stays & Hotels</p>
              </div>
              <div className="text-right font-bold text-slate-900 dark:text-slate-100">
                {accommodationCount} stays
              </div>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform">
          <span className="material-symbols-outlined">share</span>
          Share Recap
        </button>
      </div>
    </div>
  );
}
