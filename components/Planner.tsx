
import React, { useState, useCallback } from 'react';
import Card from './Card';
import { getContentIdeas } from '../services/geminiService';
import { LightBulbIcon, XIcon } from './Icons';
import { useData } from '../App';

// Modal component for editing notes
const NoteModal: React.FC<{
  day: number;
  note: string;
  onClose: () => void;
  onSave: (note: string) => void;
}> = ({ day, note, onClose, onSave }) => {
  const [currentNote, setCurrentNote] = useState(note);

  const handleSave = () => {
    onSave(currentNote);
    onClose();
  };
  
  const handleDelete = () => {
    onSave(''); // Saving an empty note is equivalent to deleting
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-brand-surface rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary hover:text-brand-text-primary">
          <XIcon className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-semibold text-brand-text-primary mb-4">Note for October {day}, 2024</h3>
        <textarea
          value={currentNote}
          onChange={(e) => setCurrentNote(e.target.value)}
          className="w-full h-40 p-3 bg-brand-background border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          placeholder="Add your plans for this day..."
        />
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="text-sm text-red-600 hover:underline"
          >
            Delete Note
          </button>
          <button
            onClick={handleSave}
            className="bg-brand-primary text-brand-text-on-primary px-6 py-2 rounded-lg hover:opacity-90 transition-all"
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
};


const Planner: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [ideas, setIdeas] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const { appData, updateCalendarNote } = useData();
  const { onboardingData } = appData;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const day = i - 3;
    if (day <= 0 || day > 31) return null;
    return day;
  });

  const handleGenerateIdeas = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setIdeas('');
    try {
      const result = await getContentIdeas(prompt, onboardingData);
      setIdeas(result);
    } catch (error) {
      console.error(error);
      setIdeas("Oh, honey. It seems there was a little hiccup getting your ideas. Let's take a breath and try again in a moment. 🙏");
    } finally {
      setIsLoading(false);
    }
  }, [prompt, onboardingData]);

  const handleDayClick = (day: number | null) => {
    if (day) {
        setSelectedDay(day);
    }
  }

  const handleSaveNote = (note: string) => {
    if (selectedDay) {
        updateCalendarNote(selectedDay, note);
    }
  }

  return (
    <div className="space-y-8">
      {selectedDay && (
        <NoteModal 
            day={selectedDay}
            note={appData.calendarNotes[selectedDay] || ''}
            onClose={() => setSelectedDay(null)}
            onSave={handleSaveNote}
        />
      )}
      <div>
        <h1 className="text-3xl font-bold text-brand-text-primary">Growth Planner</h1>
        <p className="text-brand-text-secondary mt-2">Plan with purpose. Calm, clear, and aligned—your growth, your rules.</p>
      </div>

      <Card title="October 2024 Content Calendar">
        <div className="grid grid-cols-7 gap-px bg-brand-border/30 border border-brand-border/30 rounded-lg overflow-hidden">
          {days.map(day => (
            <div key={day} className="text-center font-semibold py-2 bg-brand-surface/50 text-brand-text-secondary text-sm">{day}</div>
          ))}
          {calendarDays.map((day, index) => (
            <button 
                key={index} 
                onClick={() => handleDayClick(day)}
                disabled={!day}
                className="h-28 bg-brand-surface p-2 text-brand-text-primary text-left relative transition-colors hover:bg-brand-background disabled:hover:bg-brand-surface"
            >
              {day && <span className="text-sm">{day}</span>}
              {appData.calendarNotes[day as number] && (
                  <>
                    <div className="absolute bottom-2 left-2 right-2 text-xs bg-brand-primary-accent/50 text-brand-text-primary p-1 rounded truncate">
                        {appData.calendarNotes[day as number]}
                    </div>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full"></div>
                  </>
              )}
            </button>
          ))}
        </div>
      </Card>
      
      <Card title="AI Content Guidance">
        <div className="flex flex-col gap-4">
            <p className="text-brand-text-secondary">Need inspiration? Ask the AI for content ideas based on your unique style.</p>
            <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-3 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                rows={3}
                placeholder={onboardingData?.growth_area 
                    ? `e.g., Ideas for my goal: '${onboardingData.growth_area}'`
                    : "e.g., 'Suggest 3 reel ideas for a mindful product launch...'"
                }
                disabled={isLoading}
            />
            <button 
                onClick={handleGenerateIdeas}
                disabled={isLoading || !prompt.trim()}
                className="self-start flex items-center gap-2 bg-brand-primary text-brand-text-on-primary px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:bg-brand-text-secondary/50 disabled:cursor-not-allowed"
            >
                <LightBulbIcon className="w-5 h-5"/>
                {isLoading ? 'Generating...' : 'Generate Ideas'}
            </button>
            {isLoading && (
                <div className="w-full p-4 rounded-lg bg-brand-background">
                    <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-3 py-1">
                            <div className="h-2 bg-brand-primary-accent rounded"></div>
                            <div className="space-y-2">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="h-2 bg-brand-primary-accent rounded col-span-2"></div>
                                    <div className="h-2 bg-brand-primary-accent rounded col-span-1"></div>
                                </div>
                                <div className="h-2 bg-brand-primary-accent rounded"></div>
                                <div className="h-2 bg-brand-primary-accent rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {ideas && (
                <div className="w-full p-6 rounded-lg bg-brand-background whitespace-pre-wrap font-serif text-brand-text-primary leading-relaxed">
                    {ideas}
                </div>
            )}
        </div>
      </Card>
    </div>
  );
};

export default Planner;
