
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from './Card';
import { getReflectionInsights, generateSoundscapeScript, generateAudioFromScript } from '../services/geminiService';
import { SparklesIcon, SpeakerWaveIcon } from './Icons';
import { useAuth } from './Auth';
import { useData } from '../App';

const affirmations = [
    "My worth is not measured by my productivity.",
    "I am allowed to rest and recharge.",
    "Every step, big or small, is progress.",
    "I release the need for perfection and embrace good enough.",
    "My journey is my own, and I honor my unique path.",
    "I am building a business that supports my soul.",
    "Clarity comes from action, not from overthinking.",
    "I trust my intuition to guide my decisions.",
    "It is safe for me to be seen and successful.",
    "I attract my ideal community by being my authentic self.",
    "Rest is a vital part of my growth strategy.",
    "I celebrate my efforts, not just my outcomes.",
];

// Helper functions for audio decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const Mindset: React.FC = () => {
    const { currentUser } = useAuth();
    const { appData } = useData();
    const { platformPerformance, onboardingData } = appData;
    const [journalText, setJournalText] = useState('');
    const [reflectionPrompt, setReflectionPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [soundscapePrompt, setSoundscapePrompt] = useState('');
    const [isGeneratingSound, setIsGeneratingSound] = useState(false);
    const [soundscapeError, setSoundscapeError] = useState('');
    const [generatedAudioBuffer, setGeneratedAudioBuffer] = useState<AudioBuffer | null>(null);

    const journalKey = `soulfulHubJournal_${currentUser}`;

    const dailyAffirmations = useMemo(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const startIdx = dayOfYear % affirmations.length;
        const dailySet = [];
        for (let i = 0; i < 3; i++) {
            dailySet.push(affirmations[(startIdx + i) % affirmations.length]);
        }
        return dailySet;
    }, []);

    useEffect(() => {
        const savedJournal = localStorage.getItem(journalKey);
        if (savedJournal) {
            setJournalText(savedJournal);
        }
    }, [journalKey]);

    const handleSaveJournal = () => {
        localStorage.setItem(journalKey, journalText);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000); 
    };
    
    const handleGetReflection = useCallback(async () => {
        setIsLoading(true);
        setReflectionPrompt('');
        try {
            const result = await getReflectionInsights(platformPerformance, journalText, onboardingData);
            setReflectionPrompt(result);
        } catch (error) {
            console.error(error);
            setReflectionPrompt("My love, it seems my reflective energy is a bit low right now. Let's connect on this again in a little while. 🙏");
        } finally {
            setIsLoading(false);
        }
    }, [platformPerformance, journalText, onboardingData]);

    const handleGenerateSoundscape = useCallback(async () => {
        if (!soundscapePrompt.trim()) return;

        setIsGeneratingSound(true);
        setSoundscapeError('');
        setGeneratedAudioBuffer(null);
        
        try {
            const script = await generateSoundscapeScript(soundscapePrompt);
            if (script.includes("I'm having a little trouble")) {
                setSoundscapeError(script);
                return;
            }

            const base64Audio = await generateAudioFromScript(script);
            if (!base64Audio) {
                setSoundscapeError("Could not generate the audio at this moment. Please try again. 🙏");
                return;
            }

            const outputAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                outputAudioContext,
                24000,
                1,
            );

            setGeneratedAudioBuffer(audioBuffer); // Store buffer for replay
            
            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            source.start();

        } catch (error) {
            console.error("Error in soundscape generation process:", error);
            setSoundscapeError("Something went wrong while creating your soundscape. Let's try again in a moment. 🙏");
        } finally {
            setIsGeneratingSound(false);
        }
    }, [soundscapePrompt]);
  
    const handleReplaySoundscape = () => {
        if (!generatedAudioBuffer) return;
        const outputAudioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const source = outputAudioContext.createBufferSource();
        source.buffer = generatedAudioBuffer;
        source.connect(outputAudioContext.destination);
        source.start();
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-brand-text-primary">Mindset + Reflection</h1>
                <p className="text-brand-text-secondary mt-2">Take a moment to reflect. Growth isn’t just numbers—it’s what you’re becoming.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Your Reflection Space">
                    <div className="flex flex-col gap-4 h-full">
                        <textarea
                            value={journalText}
                            onChange={(e) => setJournalText(e.target.value)}
                            className="w-full flex-1 p-3 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition min-h-[200px]"
                            placeholder="Pour your thoughts out here... What are your wins, lessons, and shifts this week?"
                        />
                        <button
                            onClick={handleSaveJournal}
                            className="self-start bg-brand-primary text-brand-text-on-primary px-6 py-2 rounded-lg hover:opacity-90 transition-all"
                        >
                            {isSaved ? 'Saved! ✨' : 'Save Entry'}
                        </button>
                    </div>
                </Card>

                <Card title="AI-Powered Reflection">
                    <div className="flex flex-col gap-4">
                        <p className="text-brand-text-secondary">Feeling stuck? Let's find a gentle prompt to guide your reflection, based on your week and your words.</p>
                         <button
                            onClick={handleGetReflection}
                            disabled={isLoading}
                            className="self-start flex items-center gap-2 bg-brand-primary text-brand-text-on-primary px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:bg-brand-text-secondary/50 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-5 h-5"/>
                            {isLoading ? 'Reflecting...' : 'Get a Gentle Prompt'}
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {reflectionPrompt && (
                            <div className="w-full mt-2 p-6 rounded-lg bg-brand-background">
                                <p className="font-serif text-brand-text-primary leading-relaxed italic">"{reflectionPrompt}"</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <Card title="Soulful Soundscape Generator 🎧">
                <div className="flex flex-col gap-4">
                    <p className="text-brand-text-secondary">Feeling overwhelmed, stuck, or just need a moment of peace? Tell me what's on your mind, and I'll create a short, calming audio for you.</p>
                    <textarea
                        value={soundscapePrompt}
                        onChange={(e) => setSoundscapePrompt(e.target.value)}
                        className="w-full p-3 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                        rows={2}
                        placeholder="e.g., 'I'm feeling anxious about a launch' or 'I need to find focus'"
                        disabled={isGeneratingSound}
                    />
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleGenerateSoundscape}
                            disabled={isGeneratingSound || !soundscapePrompt.trim()}
                            className="self-start flex items-center gap-2 bg-brand-primary text-brand-text-on-primary px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:bg-brand-text-secondary/50 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon className="w-5 h-5"/>
                            {isGeneratingSound ? 'Creating...' : 'Create My Soundscape'}
                        </button>
                        {generatedAudioBuffer && !isGeneratingSound && (
                            <button
                                onClick={handleReplaySoundscape}
                                className="self-start flex items-center gap-2 bg-brand-primary-accent text-brand-text-primary px-4 py-2 rounded-lg hover:bg-brand-primary-accent/80 transition-colors font-medium"
                                aria-label="Play audio again"
                            >
                                <SpeakerWaveIcon className="w-5 h-5" />
                                Play Again
                            </button>
                        )}
                    </div>
                    {isGeneratingSound && (
                        <div className="w-full p-4 rounded-lg bg-brand-background">
                            <p className="text-brand-text-secondary text-center animate-pulse">Brewing a moment of calm for you...</p>
                        </div>
                    )}
                    {soundscapeError && (
                        <div className="w-full p-4 rounded-lg bg-red-50 text-red-700">
                            {soundscapeError}
                        </div>
                    )}
                </div>
            </Card>

            <Card title="Today's Soulful Affirmations">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    {dailyAffirmations.map((affirmation, index) => (
                        <div key={index} className="p-4 bg-brand-background rounded-lg flex items-center justify-center">
                            <p className="text-brand-text-secondary">"{affirmation}"</p>
                        </div>
                    ))}
                 </div>
            </Card>

        </div>
    );
};

export default Mindset;
