
import React, { useState, useEffect, useMemo } from 'react';
import Card from './Card';
import { useData } from '../App';
import { DailyLog } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { StarIcon, StarIconSolid } from './Icons';

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const StarRating: React.FC<{ rating: number; onRate: (rating: number) => void }> = ({ rating, onRate }) => {
    return (
        <div className="flex">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        key={ratingValue}
                        onClick={() => onRate(ratingValue)}
                        className="p-1 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 rounded-full"
                        aria-label={`Rate ${ratingValue} star`}
                    >
                        {ratingValue <= rating ? (
                            <StarIconSolid className="w-6 h-6 text-yellow-400" />
                        ) : (
                            <StarIcon className="w-6 h-6 text-brand-border" />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

const logCategories = [
    { id: 'branding', name: 'Branding 🌱', placeholder: 'How did you show up as your authentic self today?' },
    { id: 'business', name: 'Business 💼', placeholder: 'What actions did you take to move your business forward?' },
    { id: 'personal', name: 'Personal Growth 🧘‍♀️', placeholder: 'How did you nurture your own well-being?' },
    { id: 'financial', name: 'Financial Health 💰', placeholder: 'What steps did you take towards your financial goals?' },
    { id: 'mindset', name: 'Mindset ✨', placeholder: 'What thoughts or beliefs did you cultivate today?' },
] as const;


const DailyAlignment: React.FC = () => {
    const { appData, saveDailyLog } = useData();
    const [isSaved, setIsSaved] = useState(false);
    
    const today = getTodayDateString();
    
    const emptyLog: DailyLog = {
        date: today,
        ratings: { branding: 0, business: 0, personal: 0, financial: 0, mindset: 0 },
        notes: { branding: '', business: '', personal: '', financial: '', mindset: '' },
        winOfTheDay: '',
    };

    const [currentLog, setCurrentLog] = useState<DailyLog>(appData.dailyLogs[today] || emptyLog);
    
    useEffect(() => {
        // This ensures if the user navigates away and comes back, the form reflects any saved data for today.
        setCurrentLog(appData.dailyLogs[today] || emptyLog);
    }, [appData.dailyLogs, today]);

    const handleRatingChange = (category: keyof DailyLog['ratings'], rating: number) => {
        setCurrentLog(prev => ({
            ...prev,
            ratings: { ...prev.ratings, [category]: rating }
        }));
    };

    const handleNoteChange = (category: keyof DailyLog['notes'], text: string) => {
        setCurrentLog(prev => ({
            ...prev,
            notes: { ...prev.notes, [category]: text }
        }));
    };

    const handleSave = () => {
        saveDailyLog(currentLog);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const chartData = useMemo(() => {
        if (!appData.dailyLogs) return [];
        return Object.values(appData.dailyLogs)
            .sort((a: DailyLog, b: DailyLog) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-30) // Show last 30 entries
            .map((log: DailyLog) => ({
                date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                Branding: log.ratings.branding,
                Business: log.ratings.business,
                Personal: log.ratings.personal,
                Financial: log.ratings.financial,
                Mindset: log.ratings.mindset,
            }));
    }, [appData.dailyLogs]);
    
    const COLORS = {
        Branding: '#6B7F9A',
        Business: '#E97A35',
        Personal: '#34D399',
        Financial: '#3B82F6',
        Mindset: '#F59E0B',
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-text-primary">Daily Alignment</h1>
                <p className="text-brand-text-secondary mt-2">Track your journey, one day at a time. This is where you remember your roots.</p>
            </div>

            <Card title={`Today's Alignment: ${new Date(today).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}>
                <div className="space-y-8">
                    {logCategories.map(cat => (
                         <div key={cat.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            <div className="space-y-2">
                                <h4 className="text-lg font-semibold text-brand-text-primary">{cat.name}</h4>
                                <StarRating 
                                    rating={currentLog.ratings[cat.id]}
                                    onRate={(rating) => handleRatingChange(cat.id, rating)}
                                />
                            </div>
                            <textarea
                                value={currentLog.notes[cat.id]}
                                onChange={(e) => handleNoteChange(cat.id, e.target.value)}
                                placeholder={cat.placeholder}
                                className="w-full h-24 p-3 bg-brand-background border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                            />
                        </div>
                    ))}
                   <div className="pt-6 border-t border-brand-border/50">
                        <div className="flex justify-between items-baseline mb-2">
                             <h4 className="text-lg font-semibold text-brand-text-primary">Win of the Day 🎉</h4>
                        </div>
                      <input
                            type="text"
                            value={currentLog.winOfTheDay}
                            onChange={(e) => setCurrentLog(prev => ({ ...prev, winOfTheDay: e.target.value }))}
                            placeholder="What's one thing you're proud of today?"
                            className="w-full p-3 bg-brand-background border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                        />
                   </div>
                   <div className="flex justify-end">
                       <button
                            onClick={handleSave}
                            className="bg-brand-primary text-brand-text-on-primary px-8 py-2 rounded-lg hover:opacity-90 transition-all font-semibold"
                       >
                           {isSaved ? 'Saved! ✨' : 'Save Today\'s Alignment'}
                       </button>
                   </div>
                </div>
            </Card>

            <Card title="Your Growth Journey">
                <div className="h-96">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid stroke="hsl(var(--color-border))" strokeDasharray="3 3" strokeOpacity={0.5} />
                                <XAxis dataKey="date" stroke="hsl(var(--color-text-secondary))" />
                                <YAxis stroke="hsl(var(--color-text-secondary))" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--color-surface))', borderColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-text-primary))' }}/>
                                <Legend />
                                <Line type="monotone" dataKey="Branding" stroke={COLORS.Branding} strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Business" stroke={COLORS.Business} strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Personal" stroke={COLORS.Personal} strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Financial" stroke={COLORS.Financial} strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Mindset" stroke={COLORS.Mindset} strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-brand-text-secondary">
                            <p>Your progress chart will appear here once you log a few days. 🌿</p>
                        </div>
                    )}
                </div>
            </Card>

        </div>
    );
};

export default DailyAlignment;
