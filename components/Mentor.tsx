
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { streamChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import { PaperAirplaneIcon, SparklesIcon, PlusCircleIcon, CheckIcon } from './Icons';
import Card from './Card';
import { useData } from '../App';
import { useAuth } from './Auth';

const Mentor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [compassGoal, setCompassGoal] = useState('');
  const { appData, addNoteForToday } = useData();
  const { name } = useAuth();
  const [addedNoteIndex, setAddedNoteIndex] = useState<number | null>(null);

  useEffect(() => {
    const greetingName = name || 'beautiful soul';
    const growthContext = appData.onboardingData?.growth_area
        ? ` I see you're working on ${appData.onboardingData.growth_area}.`
        : "";

    setMessages([{
        role: 'model',
        text: `Hey ${greetingName}, welcome to your space.${growthContext} How can I support you today? ✨`
    }]);
  }, [appData.onboardingData, name]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: messageText };
    const newHistory = [...messages, userMessage];
    
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const responseStream = await streamChat(newHistory, appData.onboardingData);
      const reader = responseStream.pipeThrough(new TextDecoderStream()).getReader();
      
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        // Process Server-Sent Events (SSE)
        const lines = value.split('\n\n');
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const jsonString = line.substring(6);
                if(jsonString) {
                    try {
                        const chunk = JSON.parse(jsonString);
                        if (chunk.text) {
                            modelResponse += chunk.text;
                            setMessages(prev => {
                                const newMessages = [...prev];
                                newMessages[newMessages.length - 1] = { role: 'model', text: modelResponse };
                                return newMessages;
                            });
                        }
                    } catch (e) {
                        console.error("Failed to parse stream chunk:", jsonString);
                    }
                }
            }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'It seems there was a little glitch in our connection. Let\'s try that again. 🙏' }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, appData.onboardingData]);
  
  const handleNormalSend = () => {
    handleSendMessage(input);
  };
  
  const handleAddToPlanner = (text: string, index: number) => {
    addNoteForToday(`Mentor Idea: ${text}`);
    setAddedNoteIndex(index);
    setTimeout(() => {
        setAddedNoteIndex(null);
    }, 2500);
  };

  const startCompassSession = () => {
    if (!compassGoal.trim() || isLoading) return;
    
    // Clear messages for a fresh session, but keep the initial greeting for context
    setMessages(prev => [prev[0]]);
    const compassPrompt = `I'd like to start a "Clarity Compass" session. My goal is: "${compassGoal}". Please don't give me a plan right away. Instead, act as a gentle, soulful guide and start by asking me insightful questions to help me explore the heart of this goal. Let's start with the feeling I want to create for my audience.`;
    handleSendMessage(compassPrompt);
    setCompassGoal('');
  };


  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brand-text-primary">Your AI Mentor</h1>
        <p className="text-brand-text-secondary mt-2">I’ve got your back, Big Sis style. Let’s see how we can make things better.</p>
      </div>

      <Card title="Clarity Compass 🧭">
        <div className="flex flex-col gap-4">
            <p className="text-brand-text-secondary">Feeling stuck on a big idea? Start a guided session to find soulful clarity.</p>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={compassGoal}
                    onChange={(e) => setCompassGoal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && startCompassSession()}
                    placeholder="e.g., Launch a course, start a newsletter..."
                    className="flex-1 w-full p-2 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                    disabled={isLoading}
                />
                 <button
                    onClick={startCompassSession}
                    disabled={isLoading || !compassGoal.trim()}
                    className="flex items-center gap-2 bg-brand-primary text-brand-text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:bg-brand-text-secondary/50 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-5 h-5"/>
                    Start Session
                </button>
            </div>
        </div>
      </Card>

      <div className="flex-1 bg-brand-surface/80 border border-brand-border/30 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div ref={chatContainerRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-primary flex-shrink-0 flex items-center justify-center text-sm text-brand-text-on-primary">🌿</div>}
              <div
                className={`max-w-md p-4 rounded-2xl whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-brand-primary text-brand-text-on-primary rounded-br-none'
                    : 'bg-brand-background text-brand-text-primary rounded-bl-none'
                }`}
              >
                {msg.text}
                 {isLoading && index === messages.length - 1 && msg.role === 'model' && msg.text.length === 0 && <span className="inline-block w-2 h-2 ml-1 bg-brand-text-primary rounded-full animate-pulse"></span>}
              </div>
               {msg.role === 'model' && msg.text && !isLoading && (
                    <button 
                        onClick={() => handleAddToPlanner(msg.text, index)}
                        disabled={addedNoteIndex === index}
                        className="self-center text-brand-text-secondary/50 hover:text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Add to planner"
                    >
                        {addedNoteIndex === index ? <CheckIcon className="w-5 h-5 text-green-600" /> : <PlusCircleIcon className="w-5 h-5" />}
                    </button>
               )}
            </div>
          ))}
        </div>

        <div className="p-4 bg-brand-surface/50 border-t border-brand-border/50">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNormalSend()}
              placeholder="Ask for guidance, like 'How do I launch without burnout?'"
              className="flex-1 w-full p-3 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
              disabled={isLoading}
            />
            <button
              onClick={handleNormalSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-brand-primary text-brand-text-on-primary rounded-full hover:opacity-90 transition-all disabled:bg-brand-text-secondary/50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mentor;
