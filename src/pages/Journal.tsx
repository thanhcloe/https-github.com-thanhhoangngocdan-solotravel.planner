import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function Journal() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([
    {
      id: 1,
      date: 'Oct 12, 2023',
      title: 'First day in Paris',
      content: 'The Eiffel tower was amazing at night. Had a great croissant near the hotel.',
      mood: 'sentiment_very_satisfied'
    }
  ]);
  const [newEntry, setNewEntry] = useState('');

  const handleAddEntry = () => {
    if (!newEntry.trim()) return;
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      title: 'New Entry',
      content: newEntry,
      mood: 'sentiment_satisfied'
    };
    setEntries([entry, ...entries]);
    setNewEntry('');
  };

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
          {t('journal.title')}
        </h1>
        <div className="size-10"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Add Entry */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Write about your day..."
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none h-24"
          ></textarea>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <div className="flex gap-2 text-slate-400">
              <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">image</span></button>
              <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">location_on</span></button>
              <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">mood</span></button>
            </div>
            <button 
              onClick={handleAddEntry}
              className="px-4 py-1.5 bg-primary text-white rounded-full text-sm font-bold shadow-sm active:scale-95 transition-transform"
            >
              Save
            </button>
          </div>
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('journal.entries')}</h2>
          {entries.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{entry.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{entry.date}</p>
                </div>
                <span className="material-symbols-outlined text-amber-500">{entry.mood}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {entry.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
