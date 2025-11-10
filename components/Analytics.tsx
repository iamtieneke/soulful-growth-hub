
import React, { useState, useCallback, useMemo } from 'react';
import Card from './Card';
import { useData } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { getAnalyticsInsights } from '../services/geminiService';
import { SparklesIcon, PlusCircleIcon, CheckIcon } from './Icons';
import { DailyLog } from '../types';

const Analytics: React.FC = () => {
    const { appData, addNoteForToday } = useData();
    const { platformPerformance, onboardingData, dailyLogs } = appData;
    const [insights, setInsights] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [view, setView] = useState<'performance' | 'journey'>('performance');
    const [noteAdded, setNoteAdded] = useState(false);

    const handleGetInsights = useCallback(async () => {
        setIsLoading(true);
        setInsights('');
        try {
            const result = await getAnalyticsInsights(platformPerformance, onboardingData);
            setInsights(result);
        } catch (error) {
            console.error(error);
            setInsights("Oh, honey. It seems there was a little hiccup getting your insights. Let's take a breath and try again in a moment. 🙏");
        } finally {
            setIsLoading(false);
        }
    }, [platformPerformance, onboardingData]);

    const handleAddToPlanner = () => {
        if (!insights) return;
        addNoteForToday(`AI Insight:\n${insights}`);
        setNoteAdded(true);
        setTimeout(() => setNoteAdded(false), 2500);
    };

    const journeyChartData = useMemo(() => {
        if (!dailyLogs) return [];
        return Object.values(dailyLogs)
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
    }, [dailyLogs]);
    
    const COLORS = {
        Branding: '#6B7F9A', Business: '#E97A35', Personal: '#34D399',
        Financial: '#3B82F6', Mindset: '#F59E0B',
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-text-primary">Analytics & Insights</h1>
                <p className="text-brand-text-secondary mt-2">Let’s see what’s working and what could use a tweak. No judgment, just clarity.</p>
            </div>
            
            <div className="flex items-center gap-2 border-b border-brand-border/30 pb-2">
                <button onClick={() => setView('performance')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${view === 'performance' ? 'bg-brand-primary-accent text-brand-text-primary' : 'text-brand-text-secondary hover:bg-brand-background'}`}>Platform Performance</button>
                <button onClick={() => setView('journey')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${view === 'journey' ? 'bg-brand-primary-accent text-brand-text-primary' : 'text-brand-text-secondary hover:bg-brand-background'}`}>Growth Journey</button>
            </div>

            {view === 'performance' ? (
                 <Card title="Platform Performance">
                    <div className="h-96">
                        {platformPerformance.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={platformPerformance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid stroke="hsl(var(--color-border))" strokeDasharray="3 3" strokeOpacity={0.5} />
                                    <XAxis dataKey="name" stroke="hsl(var(--color-text-secondary))" />
                                    <YAxis stroke="hsl(var(--color-text-secondary))" />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--color-surface))', borderColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-text-primary))' }} cursor={{fill: 'hsl(var(--color-primary-accent) / 0.3)'}}/>
                                    <Legend />
                                    <Bar dataKey="engagement" fill="hsl(var(--color-primary-accent))" name="Engagement (%)" />
                                    <Bar dataKey="reach" fill="hsl(var(--color-primary))" name="Reach" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="flex items-center justify-center h-full text-brand-text-secondary">Connect a platform to see your performance data here.</div>
                        )}
                    </div>
                </Card>
            ) : (
                <Card title="Your Growth Journey">
                    <div className="h-96">
                        {journeyChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={journeyChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid stroke="hsl(var(--color-border))" strokeDasharray="3 3" strokeOpacity={0.5} />
                                    <XAxis dataKey="date" stroke="hsl(var(--color-text-secondary))" />
                                    <YAxis stroke="hsl(var(--color-text-secondary))" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--color-surface))', borderColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-text-primary))' }}/>
                                    <Legend />
                                    {Object.entries(COLORS).map(([key, color]) => (
                                         <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-brand-text-secondary">
                                <p>Your progress chart will appear here once you log a few days in Daily Alignment. 🌿</p>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            <Card title="AI-Powered Insights">
                <div className="flex flex-col items-start gap-4">
                    <button 
                        onClick={handleGetInsights}
                        disabled={isLoading || platformPerformance.length === 0}
                        className="flex items-center gap-2 bg-brand-primary text-brand-text-on-primary px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:bg-brand-text-secondary/50 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        {isLoading ? 'Thinking...' : 'Get Gentle Insights'}
                    </button>
                    {platformPerformance.length === 0 && <p className="text-sm text-brand-text-secondary">Connect a platform to generate insights.</p>}
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
                                    </div>
                                </div>
                            </div>
                         </div>
                    )}
                    {insights && (
                        <div className="w-full p-6 rounded-lg bg-brand-background whitespace-pre-wrap font-serif text-brand-text-primary leading-relaxed">
                            <div className="flex justify-between items-start">
                                <p className="flex-1">{insights}</p>
                                <button
                                    onClick={handleAddToPlanner}
                                    className="flex items-center gap-2 ml-4 text-sm bg-brand-primary-accent text-brand-text-primary px-3 py-1.5 rounded-lg hover:bg-brand-primary-accent/80 transition-colors font-medium disabled:opacity-50"
                                    disabled={noteAdded}
                                >
                                    {noteAdded ? <CheckIcon className="w-4 h-4" /> : <PlusCircleIcon className="w-4 h-4" />}
                                    {noteAdded ? 'Added!' : 'Add to Planner'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Analytics;
