
import React, { useState, useCallback } from 'react';
import Card from './Card';
import { getVisualMockupIdea } from '../services/geminiService';
import { SparklesIcon, XIcon } from './Icons';
import { useData } from '../App';
import { Template, MOCK_TEMPLATES } from '../types';

// Modal for viewing a template
const TemplateViewer: React.FC<{
  template: Template;
  onClose: () => void;
}> = ({ template, onClose }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(template.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-brand-surface rounded-xl shadow-lg w-full max-w-2xl p-6 relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary hover:text-brand-text-primary">
                    <XIcon className="w-6 h-6" />
                </button>
                <h3 className="text-xl font-semibold text-brand-text-primary mb-4 pr-8">{template.title}</h3>
                <div className="flex-1 overflow-y-auto bg-brand-background p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap font-sans text-brand-text-primary">{template.content}</pre>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleCopy}
                        className="bg-brand-primary text-brand-text-on-primary px-6 py-2 rounded-lg hover:opacity-90 transition-all w-36"
                    >
                        {copied ? 'Copied! ✨' : 'Copy Text'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal for creating a new template
const CreateTemplate: React.FC<{
    onClose: () => void;
    onSave: (template: Omit<Template, 'id'>) => void;
}> = ({ onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<'swipe' | 'campaign'>('swipe');

    const handleSave = () => {
        if(title.trim() && content.trim()){
            onSave({ title, content, type });
            onClose();
        }
    }

    return (
         <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
            <div className="bg-brand-surface rounded-xl shadow-lg w-full max-w-2xl p-6 relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary hover:text-brand-text-primary">
                    <XIcon className="w-6 h-6" />
                </button>
                <h3 className="text-xl font-semibold text-brand-text-primary mb-4">Create New Template</h3>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Template Title" className="w-full p-3 bg-brand-background border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition" />
                    <select value={type} onChange={e => setType(e.target.value as 'swipe' | 'campaign')} className="w-full p-3 bg-brand-background border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition">
                        <option value="swipe">Swipe File</option>
                        <option value="campaign">Launch & Campaign Template</option>
                    </select>
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Template content goes here..." className="w-full h-64 p-3 bg-brand-background border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"></textarea>
                </div>
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={!title.trim() || !content.trim()}
                        className="bg-brand-primary text-brand-text-on-primary px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:bg-brand-text-secondary/50"
                    >
                       Save Template
                    </button>
                </div>
            </div>
        </div>
    )
}

const Templates: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [idea, setIdea] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const { appData, addTemplate } = useData();

    const swipeFiles = MOCK_TEMPLATES.filter(t => t.type === 'swipe');
    const campaigns = MOCK_TEMPLATES.filter(t => t.type === 'campaign');
    const customSwipeFiles = appData.customTemplates.filter(t => t.type === 'swipe');
    const customCampaigns = appData.customTemplates.filter(t => t.type === 'campaign');


    const handleGenerateIdea = useCallback(async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setIdea('');
        try {
            const result = await getVisualMockupIdea(prompt);
            setIdea(result);
        } catch (error) {
            console.error(error);
            setIdea("Oh, love. My creative spark seems to be dim at the moment. Let's give it a little rest and try again soon. 🙏");
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="space-y-8">
            {selectedTemplate && <TemplateViewer template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />}
            {isCreating && <CreateTemplate onClose={() => setIsCreating(false)} onSave={addTemplate} />}

            <div>
                <h1 className="text-3xl font-bold text-brand-text-primary">Templates & Resources</h1>
                <p className="text-brand-text-secondary mt-2">Here’s inspiration to make your growth easier, aligned, and soulful.</p>
            </div>
            
            <Card title="Your Custom Templates">
                <div className="space-y-4">
                     <button onClick={() => setIsCreating(true)} className="bg-brand-primary-accent text-brand-text-primary px-4 py-2 rounded-lg hover:bg-brand-primary-accent/80 transition-colors font-medium">
                        + Create New Template
                    </button>
                    {appData.customTemplates.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {customSwipeFiles.map(t => <button key={t.id} onClick={() => setSelectedTemplate(t)} className="p-4 bg-brand-background rounded-lg text-left hover:bg-brand-primary-accent/50 transition-colors">{t.title}</button>)}
                             {customCampaigns.map(t => <button key={t.id} onClick={() => setSelectedTemplate(t)} className="p-4 bg-brand-background rounded-lg text-left hover:bg-brand-primary-accent/50 transition-colors">{t.title}</button>)}
                         </div>
                    ) : (
                        <p className="text-brand-text-secondary">Your created templates will appear here. 🌿</p>
                    )}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Swipe Files">
                    <ul className="space-y-2">
                        {swipeFiles.map(template => (
                            <li key={template.id}>
                                <button onClick={() => setSelectedTemplate(template)} className="text-brand-primary hover:underline text-left w-full">{template.title}</button>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card title="Launch & Campaign Templates">
                     <ul className="space-y-2">
                         {campaigns.map(template => (
                            <li key={template.id}>
                                <button onClick={() => setSelectedTemplate(template)} className="text-brand-primary hover:underline text-left w-full">{template.title}</button>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            <Card title="AI Visual Mockup Generator">
                <div className="flex flex-col gap-4">
                    <p className="text-brand-text-secondary">Stuck on the visuals? Describe your post idea, and I'll generate a soulful mockup concept for you.</p>
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full p-3 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                        rows={3}
                        placeholder="e.g., 'A carousel post about the benefits of journaling for creativity...'"
                        disabled={isLoading}
                    />
                    <button 
                        onClick={handleGenerateIdea}
                        disabled={isLoading || !prompt.trim()}
                        className="self-start flex items-center gap-2 bg-brand-primary text-brand-text-on-primary px-6 py-2 rounded-lg hover:opacity-90 transition-all disabled:bg-brand-text-secondary/50 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        {isLoading ? 'Dreaming up...' : 'Generate Visual Idea'}
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {idea && (
                        <div className="w-full p-6 rounded-lg bg-brand-background whitespace-pre-wrap font-serif text-brand-text-primary leading-relaxed">
                            {idea}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Templates;
