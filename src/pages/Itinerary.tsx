import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { GoogleGenAI, Type } from '@google/genai';

interface TimelineItem {
  id: string;
  type: 'food' | 'activity' | 'transport' | 'accommodation';
  title: string;
  time: string;
  location?: string;
  cost?: string;
  icon: string;
  image?: string;
}

const initialItems: TimelineItem[] = [
  { id: '1', type: 'food', title: 'Breakfast at Cafe Luna', time: '09:00', location: 'Shibuya District', cost: '$15', icon: 'coffee' },
  { id: '2', type: 'activity', title: 'Art Museum Visit', time: '11:30', location: 'Ueno Park', cost: '$25', icon: 'museum', image: 'https://images.unsplash.com/photo-1518998053401-a4149019b802?q=80&w=2070&auto=format&fit=crop' },
  { id: '3', type: 'food', title: 'Ramen Street Lunch', time: '13:30', location: 'Tokyo Station', cost: '$12', icon: 'restaurant' },
  { id: '4', type: 'activity', title: 'Gyoen National Garden', time: '15:30', location: 'Shinjuku', cost: 'Free', icon: 'park' },
];

const formatTimeDisplay = (time24: string) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  if (!hours || !minutes) return time24;
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
};

export default function Itinerary() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const destination = searchParams.get('destination') || 'Tokyo, Japan';
  const date = searchParams.get('date') || '';

  const [arrivalDate, setArrivalDate] = useState(date || new Date().toISOString().split('T')[0]);
  
  // Initialize departure date based on URL duration or default 3 days
  const initialDuration = searchParams.get('duration') || '3';
  const initialDeparture = () => {
    const d = new Date(arrivalDate);
    d.setDate(d.getDate() + parseInt(initialDuration, 10) - 1);
    return d.toISOString().split('T')[0];
  };
  
  const [departureDate, setDepartureDate] = useState(initialDeparture());

  // Calculate duration based on arrival and departure dates
  const calculateDuration = (arrival: string, departure: string) => {
    if (!arrival || !departure) return '1';
    const a = new Date(arrival);
    const d = new Date(departure);
    if (d < a) return '1';
    const diffTime = Math.abs(d.getTime() - a.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays.toString();
  };

  const duration = calculateDuration(arrivalDate, departureDate);
  const [showPreferences, setShowPreferences] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSavePlan = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const [items, setItems] = useState<TimelineItem[]>(initialItems);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<{id?: string, type: 'food'|'activity'|'transport'|'accommodation', title: string, time: string, location: string, cost: string, image?: string}>({
    type: 'activity',
    title: '',
    time: '10:00',
    location: '',
    cost: '',
    image: ''
  });

  const [currency, setCurrency] = useState<string>('VNĐ');
  const [locationSuggestions, setLocationSuggestions] = useState<{name: string, type: string}[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const addLocation = searchParams.get('addLocation');
    if (addLocation) {
      const fetchAndAdd = async () => {
        const newItemId = Date.now().toString();
        const newTimelineItem: TimelineItem = {
          id: newItemId,
          type: 'activity',
          title: `Visit ${addLocation}`,
          time: '10:00',
          location: addLocation,
          cost: 'Loading...',
          icon: 'local_activity',
        };
        setItems(prev => [...prev, newTimelineItem]);
        
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('addLocation');
        navigate(`/app/itinerary?${newParams.toString()}`, { replace: true });

        let imageUrl = '';
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
          const imgResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [{ text: `A beautiful, high quality travel photo of ${addLocation} in ${destination}. Scenic, aesthetic, travel photography style.` }]
            },
            config: {
              imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
            }
          });
          
          if (imgResponse.candidates && imgResponse.candidates[0] && imgResponse.candidates[0].content.parts) {
            for (const part of imgResponse.candidates[0].content.parts) {
              if (part.inlineData) {
                const base64EncodeString = part.inlineData.data;
                imageUrl = `data:image/png;base64,${base64EncodeString}`;
                break;
              }
            }
          }
        } catch (error) {
          console.error("Error generating image:", error);
        }

        let cost = '';
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
          const priceResponse = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `What is the typical estimated cost/price range for a visit/meal/activity at "${addLocation}" in "${destination}"? Return a JSON object with 'cost' (a string like "150.000 - 300.000" or "Free" or "15 - 30") and 'currency' (the local currency symbol or code, e.g., "VNĐ", "USD", "JPY", "€").`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  cost: { type: Type.STRING },
                  currency: { type: Type.STRING }
                },
                required: ["cost", "currency"]
              }
            }
          });
          
          const text = priceResponse.text;
          if (text) {
            const data = JSON.parse(text);
            cost = `${data.cost} ${data.currency}`;
          }
        } catch (error) {
          console.error("Error fetching price:", error);
        }

        setItems(prev => prev.map(item => item.id === newItemId ? {
          ...item,
          image: imageUrl || item.image,
          cost: cost || 'Unknown'
        } : item));
      };

      fetchAndAdd();
    }
  }, [searchParams, destination, navigate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowLocationSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    if (!newItem.location.trim() || !showLocationSuggestions) {
      setLocationSuggestions([]);
      setIsSearchingLocation(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsSearchingLocation(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Suggest 5 specific places, landmarks, or venues in "${destination}" matching the keyword "${newItem.location}" and the category "${newItem.type}". Return a JSON array of objects with 'name' (the place name) and 'type' (e.g., restaurant, museum, park).`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING }
                },
                required: ["name", "type"]
              }
            }
          }
        });
        
        if (response.text) {
          const parsed = JSON.parse(response.text);
          setLocationSuggestions(parsed);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsSearchingLocation(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [newItem.location, newItem.type, destination, showLocationSuggestions]);

  const handleLocationSelect = async (locName: string) => {
    setNewItem(prev => ({ ...prev, location: locName }));
    setShowLocationSuggestions(false);
    
    // Fetch image
    setIsGeneratingImage(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const imgResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `A beautiful, high quality travel photo of ${locName} in ${destination}. Scenic, aesthetic, travel photography style.` }]
        },
        config: {
          imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
        }
      });
      
      if (imgResponse.candidates && imgResponse.candidates[0] && imgResponse.candidates[0].content.parts) {
        for (const part of imgResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            setNewItem(prev => ({ ...prev, image: `data:image/png;base64,${base64EncodeString}` }));
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGeneratingImage(false);
    }

    // Fetch price range
    setIsFetchingPrice(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const priceResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `What is the typical estimated cost/price range for a visit/meal/activity at "${locName}" in "${destination}"? Return a JSON object with 'cost' (a string like "150.000 - 300.000" or "Free" or "15 - 30") and 'currency' (the local currency symbol or code, e.g., "VNĐ", "USD", "JPY", "€").`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              cost: { type: Type.STRING },
              currency: { type: Type.STRING }
            },
            required: ["cost", "currency"]
          }
        }
      });
      
      const text = priceResponse.text;
      if (text) {
        const data = JSON.parse(text);
        setNewItem(prev => ({ ...prev, cost: data.cost }));
        setCurrency(data.currency);
      }
    } catch (error) {
      console.error("Error fetching price:", error);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.title) return;
    
    let icon = 'local_activity';
    if (newItem.type === 'food') icon = 'restaurant';
    if (newItem.type === 'transport') icon = 'directions_bus';
    if (newItem.type === 'accommodation') icon = 'hotel';

    const finalCost = newItem.cost ? `${currency === 'USD' ? '$' : ''}${newItem.cost}${currency === 'VND' ? ' VNĐ' : ''}` : '';

    if (isEditing && newItem.id) {
      setItems(items.map(item => item.id === newItem.id ? {
        ...item,
        type: newItem.type,
        title: newItem.title,
        time: newItem.time,
        location: newItem.location,
        cost: finalCost,
        icon: icon,
        image: newItem.image || item.image
      } : item));
    } else {
      const newTimelineItem: TimelineItem = {
        id: Date.now().toString(),
        type: newItem.type,
        title: newItem.title,
        time: newItem.time,
        location: newItem.location,
        cost: finalCost,
        icon: icon,
        image: newItem.image
      };
      setItems([...items, newTimelineItem]);
    }

    setShowAddModal(false);
    setIsEditing(false);
    setNewItem({ type: 'activity', title: '', time: '12:00', location: '', cost: '', image: '' });
  };

  const handleEditItem = (item: TimelineItem) => {
    let costVal = item.cost || '';
    let curr: 'VND' | 'USD' = 'VND';
    if (costVal.startsWith('$')) {
      curr = 'USD';
      costVal = costVal.substring(1).trim();
    } else if (costVal.endsWith('VNĐ')) {
      curr = 'VND';
      costVal = costVal.replace('VNĐ', '').trim();
    }

    setCurrency(curr);
    setNewItem({
      id: item.id,
      type: item.type,
      title: item.title,
      time: item.time,
      location: item.location || '',
      cost: costVal,
      image: item.image || ''
    });
    setIsEditing(true);
    setShowAddModal(true);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setNewItem({ type: 'activity', title: '', time: '12:00', location: '', cost: '', image: '' });
    setShowAddModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setItems(items.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center p-4 justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight">{t('itinerary.title')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{destination} {date ? `• ${date}` : ''}</p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={handleSavePlan}
              className={`flex items-center gap-1 px-3 h-10 rounded-full font-bold transition-all ${isSaved ? 'bg-emerald-500 text-white' : 'bg-primary text-white hover:bg-primary/90'}`}
            >
              <span className="material-symbols-outlined text-sm">{isSaved ? 'check' : 'save'}</span>
              <span className="text-sm hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button 
              onClick={() => {
                const itemsData = encodeURIComponent(JSON.stringify(items));
                navigate(`/app/trip-recap?destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}&duration=${encodeURIComponent(duration)}&items=${itemsData}`);
              }}
              className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              title={t('recap.title')}
            >
              <span className="material-symbols-outlined">summarize</span>
            </button>
            <button className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              <span className="material-symbols-outlined">map</span>
            </button>
          </div>
        </div>

        {/* Preferences Form / Summary */}
        <div className="px-4 pb-4">
          {showPreferences ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('itinerary.customize')}</h3>
                <button 
                  onClick={() => setShowPreferences(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Arrival Date</label>
                  <input 
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => {
                      const newArrival = e.target.value;
                      setArrivalDate(newArrival);
                      if (new Date(newArrival) > new Date(departureDate)) {
                        setDepartureDate(newArrival);
                      }
                    }}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-2 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Departure Date</label>
                  <input 
                    type="date"
                    value={departureDate}
                    min={arrivalDate}
                    onChange={(e) => {
                      setDepartureDate(e.target.value);
                    }}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm p-2 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
              <button 
                onClick={() => setShowPreferences(false)}
                className="w-full mt-2 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                {t('itinerary.save')}
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-3 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('itinerary.tripSummary')}</h3>
                <button 
                  onClick={() => setShowPreferences(true)}
                  className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                >
                  {t('itinerary.customize')}
                </button>
              </div>
              
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                <div className="flex-1 flex justify-between items-center">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Arrival</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{arrivalDate ? new Date(arrivalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}</span>
                  </div>
                  
                  <div className="flex flex-col items-center px-2 text-slate-300 dark:text-slate-600">
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    <span className="text-[10px] font-bold">{duration} {t('itinerary.days')}</span>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Departure</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{departureDate ? new Date(departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pb-2">
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8 overflow-x-auto no-scrollbar">
            {Array.from({ length: parseInt(duration, 10) || 1 }).map((_, index) => (
              <button 
                key={index} 
                className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 min-w-[60px] ${index === 0 ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400'}`}
              >
                <p className={`text-sm ${index === 0 ? 'font-bold' : 'font-medium'}`}>{t('itinerary.day')} {index + 1}</p>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Timeline */}
        <div className="relative space-y-0 pl-2">
          <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

          {items.map((item) => (
            <div key={item.id} className="relative flex items-start gap-4 pb-8 group">
              <div className={`z-10 flex size-10 items-center justify-center rounded-full shadow-lg border-2 ${
                item.type === 'food' ? 'bg-primary text-white shadow-primary/30 border-primary' : 
                item.type === 'transport' ? 'bg-amber-500 text-white shadow-amber-500/30 border-amber-500' :
                item.type === 'accommodation' ? 'bg-purple-500 text-white shadow-purple-500/30 border-purple-500' :
                'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}>
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex flex-col bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{item.title}</h3>
                    <div className="flex items-center gap-2">
                      {item.cost && <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{item.cost}</span>}
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="text-slate-400 hover:text-blue-500 transition-colors"
                        title={t('itinerary.editItem')}
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button 
                        onClick={() => setItemToDelete(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title={t('itinerary.deleteItem')}
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span>{formatTimeDisplay(item.time)}</span>
                    </div>
                    {item.location && (
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                  {item.image && (
                    <div className="mt-3 overflow-hidden rounded-lg">
                      <img 
                        className="w-full h-24 object-cover" 
                        src={item.image} 
                        alt={item.title}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Item Button */}
          <div className="relative flex items-start gap-4 pt-2">
            <div className="z-10 flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700">
              <span className="material-symbols-outlined text-xl">add</span>
            </div>
            <div className="flex-1 pt-1">
              <button 
                onClick={openAddModal}
                className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary hover:border-primary/50 transition-colors"
              >
                <span className="material-symbols-outlined">add_circle</span>
                {t('itinerary.addItem')}
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{isEditing ? t('itinerary.editItem') : t('itinerary.addItem')}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('itinerary.type')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setNewItem({...newItem, type: 'activity'})}
                    className={`p-2 rounded-lg border text-sm font-semibold flex flex-col items-center gap-1 transition-colors ${newItem.type === 'activity' ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined">local_activity</span>
                    {t('itinerary.addActivity')}
                  </button>
                  <button 
                    onClick={() => setNewItem({...newItem, type: 'transport'})}
                    className={`p-2 rounded-lg border text-sm font-semibold flex flex-col items-center gap-1 transition-colors ${newItem.type === 'transport' ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined">directions_bus</span>
                    {t('itinerary.addTransport')}
                  </button>
                  <button 
                    onClick={() => setNewItem({...newItem, type: 'food'})}
                    className={`p-2 rounded-lg border text-sm font-semibold flex flex-col items-center gap-1 transition-colors ${newItem.type === 'food' ? 'bg-primary/10 border-primary text-primary' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined">restaurant</span>
                    {t('itinerary.addFood')}
                  </button>
                  <button 
                    onClick={() => setNewItem({...newItem, type: 'accommodation'})}
                    className={`p-2 rounded-lg border text-sm font-semibold flex flex-col items-center gap-1 transition-colors ${newItem.type === 'accommodation' ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined">hotel</span>
                    {t('itinerary.addAccommodation')}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('itinerary.itemTitle')}</label>
                <input 
                  type="text" 
                  list="title-suggestions"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Visit Tokyo Tower"
                />
                <datalist id="title-suggestions">
                  {newItem.type === 'food' && (
                    <>
                      <option value="Breakfast" />
                      <option value="Lunch" />
                      <option value="Dinner" />
                      <option value="Coffee Break" />
                      <option value="Street Food" />
                    </>
                  )}
                  {newItem.type === 'activity' && (
                    <>
                      <option value="Museum Visit" />
                      <option value="City Tour" />
                      <option value="Shopping" />
                      <option value="Temple Visit" />
                      <option value="Park Walk" />
                    </>
                  )}
                  {newItem.type === 'transport' && (
                    <>
                      <option value="Flight" />
                      <option value="Train" />
                      <option value="Bus" />
                      <option value="Taxi" />
                      <option value="Subway" />
                    </>
                  )}
                  {newItem.type === 'accommodation' && (
                    <>
                      <option value="Check-in" />
                      <option value="Check-out" />
                      <option value="Hotel Stay" />
                      <option value="Hostel" />
                      <option value="Resort" />
                    </>
                  )}
                </datalist>
              </div>

              <div className="flex flex-col gap-1 relative" ref={wrapperRef}>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('itinerary.itemLocation')}</label>
                <input 
                  type="text" 
                  value={newItem.location}
                  onChange={(e) => {
                    setNewItem({...newItem, location: e.target.value});
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => setShowLocationSuggestions(true)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Shibuya District"
                  autoComplete="off"
                />
                
                {showLocationSuggestions && (newItem.location.length > 0 || isSearchingLocation) && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 max-h-60 overflow-y-auto">
                    {isSearchingLocation ? (
                      <div className="px-4 py-4 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                        <span className="text-sm font-medium">Finding places...</span>
                      </div>
                    ) : locationSuggestions.length > 0 ? (
                      locationSuggestions.map((loc, index) => (
                        <div 
                          key={loc.name + index}
                          className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-900 dark:text-slate-100 border-b border-slate-50 dark:border-slate-700/50 last:border-0"
                          onClick={() => handleLocationSelect(loc.name)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">
                              {loc.type.toLowerCase().includes('restaurant') || loc.type.toLowerCase().includes('food') ? 'restaurant' : 
                               loc.type.toLowerCase().includes('park') ? 'park' : 
                               loc.type.toLowerCase().includes('museum') ? 'museum' : 'location_on'}
                            </span>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">{loc.name}</span>
                              <span className="text-xs text-slate-500">{loc.type}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-4 text-center text-sm text-slate-500">
                        No suggestions found.
                      </div>
                    )}
                  </div>
                )}
                
                {isGeneratingImage && (
                  <div className="mt-2 relative rounded-lg overflow-hidden h-24 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-slate-400">refresh</span>
                      <span className="text-xs text-slate-500 font-medium">Generating image...</span>
                    </div>
                  </div>
                )}
                {newItem.image && !isGeneratingImage && (
                  <div className="mt-2 relative rounded-lg overflow-hidden h-24 border border-slate-200 dark:border-slate-700">
                    <img src={newItem.image} alt="Location preview" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setNewItem({...newItem, image: ''})}
                      className="absolute top-1 right-1 size-6 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('itinerary.itemTime')}</label>
                <input 
                  type="time" 
                  value={newItem.time}
                  onChange={(e) => setNewItem({...newItem, time: e.target.value})}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('itinerary.itemCost')}</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary w-20 text-center"
                    placeholder="Cur"
                  />
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={newItem.cost}
                      onChange={(e) => setNewItem({...newItem, cost: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary"
                      placeholder="e.g. 150.000"
                    />
                    {isFetchingPrice && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <span className="material-symbols-outlined animate-spin text-slate-400 text-sm">refresh</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 shrink-0">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t('itinerary.cancel')}
              </button>
              <button 
                onClick={handleAddItem}
                disabled={!newItem.title}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {t('itinerary.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-red-500 text-2xl">warning</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{t('itinerary.deleteItem')}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{t('itinerary.confirmDelete')}</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t('itinerary.cancel')}
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                {t('itinerary.deleteItem')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-4 flex flex-col items-end gap-3 z-30">
        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">
          <span className="material-symbols-outlined text-primary">spa</span>
          {t('itinerary.relaxPlan')}
        </button>
        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">
          <span className="material-symbols-outlined text-orange-500">restaurant</span>
          {t('itinerary.moreFood')}
        </button>
        <button className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">
          <span className="material-symbols-outlined text-green-500">verified_user</span>
          {t('itinerary.saferVersion')}
        </button>
        <button className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all mt-2">
          <span className="material-symbols-outlined text-2xl">auto_awesome</span>
        </button>
      </div>
    </div>
  );
}
