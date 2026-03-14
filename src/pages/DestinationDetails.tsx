import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, MapPin, Sparkles, Utensils, Calendar } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const NEIGHBORHOODS = [
  { name: "Centro Storico", desc: "The heart of the action with the best shops and restaurants." },
  { name: "Fornillo", desc: "A quieter, more relaxed area with a beautiful, less crowded beach." }
];

const FALLBACK_NEIGHBORHOOD_IMAGES: Record<string, string> = {
  "Centro Storico": "https://images.unsplash.com/photo-1599827552599-eadf5af3c587?q=80&w=1974&auto=format&fit=crop",
  "Fornillo": "https://images.unsplash.com/photo-1621682372775-533449e55020?q=80&w=1974&auto=format&fit=crop"
};

export default function DestinationDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destinationName = searchParams.get('name') || "Positano, Italy";
  
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [neighborhoodImages, setNeighborhoodImages] = useState<Record<string, string>>({});
  const [isGeneratingNeighborhoods, setIsGeneratingNeighborhoods] = useState(false);

  useEffect(() => {
    const generateImage = async () => {
      setIsGenerating(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `A beautiful, realistic, high-quality travel photography shot of ${destinationName}. Scenic, authentic, real-world photo.` }]
          },
          config: {
            imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
          }
        });
        
        if (response.candidates && response.candidates[0] && response.candidates[0].content.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64EncodeString = part.inlineData.data;
              setHeaderImage(`data:image/png;base64,${base64EncodeString}`);
              break;
            }
          }
        }
      } catch (error: any) {
        if (error?.status === 429 || error?.message?.includes('429')) {
          console.warn("Rate limit exceeded for header image, using fallback.");
        } else {
          console.error("Error generating image:", error);
        }
      } finally {
        setIsGenerating(false);
      }
    };

    generateImage();
  }, [destinationName]);

  useEffect(() => {
    const fetchNeighborhoodImages = async () => {
      setIsGeneratingNeighborhoods(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        
        for (const nb of NEIGHBORHOODS) {
          try {
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                parts: [{ text: `A beautiful, realistic, high-quality travel photography shot of ${nb.name} neighborhood in ${destinationName}. Scenic, authentic, real-world photo.` }]
              },
              config: {
                imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
              }
            });
            
            if (response.candidates && response.candidates[0] && response.candidates[0].content.parts) {
              for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                  const base64EncodeString = part.inlineData.data;
                  setNeighborhoodImages(prev => ({
                    ...prev,
                    [nb.name]: `data:image/png;base64,${base64EncodeString}`
                  }));
                  break;
                }
              }
            }
          } catch (err: any) {
            if (err?.status === 429 || err?.message?.includes('429')) {
              console.warn(`Rate limit exceeded for ${nb.name}, using fallback.`);
            } else {
              console.error(`Error generating image for ${nb.name}:`, err);
            }
          }
        }
      } finally {
        setIsGeneratingNeighborhoods(false);
      }
    };

    fetchNeighborhoodImages();
  }, [destinationName]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24 font-sans">
      {/* Header Image & Top Bar */}
      <div className="relative h-[55vh] w-full bg-slate-200 shrink-0">
        {headerImage ? (
          <img 
            src={headerImage} 
            alt={destinationName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-slate-400">refresh</span>
                <span className="text-sm text-slate-500 font-medium">Generating image...</span>
              </div>
            ) : (
              <img 
                src="https://images.unsplash.com/photo-1516483638261-f40af5eb6075?q=80&w=1974&auto=format&fit=crop" 
                alt={destinationName}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9fa] via-transparent to-transparent h-full w-full"></div>
        
        {/* Top Bar Buttons */}
        <div className="absolute top-6 left-4 right-4 flex justify-between items-center z-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm text-slate-800 backdrop-blur-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-3">
            <button className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm text-slate-800 backdrop-blur-sm">
              <Heart size={20} />
            </button>
            <button className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm text-slate-800 backdrop-blur-sm">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 relative z-10 space-y-8">
        {/* Title & Tags */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-100/80 text-blue-600 text-[10px] font-bold tracking-wider uppercase rounded-full">
              Romantic & Scenic
            </span>
            <span className="px-3 py-1 bg-blue-100/80 text-blue-600 text-[10px] font-bold tracking-wider uppercase rounded-full">
              Coastal Luxury
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{destinationName}</h1>
          <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
            <MapPin size={16} className="text-blue-600" />
            Amalfi Coast, Campania
          </div>
        </div>

        {/* Why this fits you */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Why this fits you</h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
              <div className="flex-shrink-0 flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Matches your aesthetic</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Based on your saved inspiration, you love vertical coastal architecture and vibrant Mediterranean hues.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
              <div className="flex-shrink-0 flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                <Utensils size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Culinary alignment</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Positano's focus on fresh seafood and lemon-infused cuisine perfectly matches your diet preferences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Neighborhoods */}
        <section className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-slate-900">Recommended Neighborhoods</h2>
            <button className="text-blue-600 text-sm font-semibold">See All</button>
          </div>
          <div className="flex overflow-x-auto pb-4 -mx-5 px-5 gap-4 snap-x hide-scrollbar">
            {NEIGHBORHOODS.map((nb) => (
              <div key={nb.name} className="min-w-[280px] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden snap-center">
                {neighborhoodImages[nb.name] ? (
                  <img 
                    src={neighborhoodImages[nb.name]} 
                    alt={nb.name}
                    className="w-full h-36 object-cover"
                  />
                ) : isGeneratingNeighborhoods ? (
                  <div className="w-full h-36 flex items-center justify-center bg-slate-100">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-slate-400">refresh</span>
                      <span className="text-xs text-slate-500 font-medium">Generating...</span>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={FALLBACK_NEIGHBORHOOD_IMAGES[nb.name] || "https://images.unsplash.com/photo-1516483638261-f40af5eb6075?q=80&w=1974&auto=format&fit=crop"} 
                    alt={nb.name}
                    className="w-full h-36 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-1">{nb.name}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2">
                    {nb.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Must-try experiences */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Must-try experiences</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                1
              </div>
              <span className="text-slate-800 font-medium">Private Sunset Boat Tour</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                2
              </div>
              <span className="text-slate-800 font-medium">Hike the Path of the Gods</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                3
              </div>
              <span className="text-slate-800 font-medium">Ceramic Workshop in Centro</span>
            </div>
          </div>
        </section>

        {/* Food highlights */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Food highlights</h2>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-sm border border-slate-100">
              <span className="text-lg">🍋</span>
              <span className="text-sm font-medium text-slate-800">Delizia al Limone</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full shadow-sm border border-slate-100">
              <span className="text-lg">🍝</span>
              <span className="text-sm font-medium text-slate-800">Scialatielli ai Frutti di Mare</span>
            </div>
          </div>
        </section>

        {/* Solo safety rating */}
        <section className="pb-8">
          <div className="bg-[#f0f4f8] p-5 rounded-2xl border border-blue-50/50">
            <div className="flex justify-between items-end mb-3">
              <h2 className="text-lg font-bold text-slate-900">Solo safety rating</h2>
              <div className="text-blue-600 font-bold text-2xl">
                4.8 <span className="text-slate-400 text-sm font-medium">/ 5</span>
              </div>
            </div>
            <div className="w-full h-2 bg-blue-100 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '96%' }}></div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Extremely safe for solo travelers. Well-lit main streets, friendly locals, and a high volume of international visitors year-round.
            </p>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-50 pb-safe max-w-md mx-auto">
        <button 
          onClick={() => navigate(`/app/itinerary?destination=${encodeURIComponent(destinationName)}&addLocation=${encodeURIComponent(destinationName)}`)}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#007AFF] text-white rounded-xl font-bold text-lg shadow-sm active:scale-[0.98] transition-transform"
        >
          <Calendar size={20} />
          Build itinerary
        </button>
      </div>
      
      {/* CSS to hide scrollbar but keep functionality */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pb-safe {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
}
