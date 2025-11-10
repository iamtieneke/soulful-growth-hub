
import React, { useRef } from 'react';
import Card from './Card';
import { useTheme } from './ThemeProvider';
import { useAuth } from './Auth';

// Helper to convert HSL string to hex
const hslStringToHex = (hsl: string): string => {
    if (!hsl) return '#000000';
    const hslMatch = hsl.match(/(\d+(\.\d+)?)/g);
    if (!hslMatch || hslMatch.length < 3) return '#000000';
    
    const [h, s, l] = hslMatch.map(Number);
    const sDecimal = s / 100;
    const lDecimal = l / 100;
    const c = (1 - Math.abs(2 * lDecimal - 1)) * sDecimal;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lDecimal - c / 2;
    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { [r, g, b] = [c, x, 0]; }
    else if (h >= 60 && h < 120) { [r, g, b] = [x, c, 0]; }
    else if (h >= 120 && h < 180) { [r, g, b] = [0, c, x]; }
    else if (h >= 180 && h < 240) { [r, g, b] = [0, x, c]; }
    else if (h >= 240 && h < 300) { [r, g, b] = [x, 0, c]; }
    else if (h >= 300 && h < 360) { [r, g, b] = [c, 0, x]; }

    const toHex = (val: number) => {
        const hex = Math.round((val + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const themeOptions = [
    { id: 'soulfulCalm', name: 'Soulful Calm', colors: ['#EBF4FA', '#D6E4F0', '#6B7F9A'] },
    { id: 'focusFlow', name: 'Focus Flow', colors: ['#FEF7F0', '#FBD9B3', '#E97A35'] },
    { id: 'soulfulNight', name: 'Soulful Night', colors: ['#232E3A', '#3C5069', '#8AB4F8'] },
];

const colorCustomizationFields = [
    { id: 'background', name: 'Background' },
    { id: 'surface', name: 'Surface' },
    { id: 'border', name: 'Border' },
    { id: 'primary', name: 'Primary' },
    { id: 'primaryAccent', name: 'Primary Accent' },
    { id: 'textPrimary', name: 'Primary Text' },
    { id: 'textSecondary', name: 'Secondary Text' },
    { id: 'textOnPrimary', name: 'Text on Primary' },
];

const Settings: React.FC = () => {
    const { theme, setTheme, currentColors, setCustomColor } = useTheme();
    const { profilePic, setProfilePic } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
    };

    const handlePicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-brand-text-primary">Settings & Customization</h1>
                <p className="text-brand-text-secondary mt-2">Make this space feel like your own. Adjust the colors and themes to match your energy. 🌿</p>
            </div>

            <Card title="Profile Picture">
                <div className="flex items-center gap-6">
                    <img src={profilePic || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="hsl(${currentColors.textSecondary})" class="w-24 h-24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`} alt="Profile" className="w-24 h-24 rounded-full object-cover bg-brand-background" />
                    <div>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePicUpload} className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="bg-brand-primary text-brand-text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition-all">
                            Upload Picture
                        </button>
                        <p className="text-sm text-brand-text-secondary mt-2">Recommended: 200x200px</p>
                    </div>
                </div>
            </Card>

            <Card title="Choose Your Theme">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {themeOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleThemeChange(option.id)}
                            className={`p-4 rounded-lg border-2 transition-all ${theme === option.id ? 'border-brand-primary shadow-md' : 'border-brand-border/50 hover:border-brand-primary/50'}`}
                        >
                            <div className="flex justify-center space-x-2 mb-3">
                                {option.colors.map(color => (
                                    <div key={color} className="w-8 h-8 rounded-full border border-black/10" style={{ backgroundColor: color }}></div>
                                ))}
                            </div>
                            <p className="font-semibold text-brand-text-primary">{option.name}</p>
                        </button>
                    ))}
                </div>
            </Card>

            <Card title="Customize Your Colors">
                <div className="flex flex-col gap-6">
                    <p className="text-brand-text-secondary">
                        Fine-tune your palette for a perfectly aligned experience. Select 'Custom' theme to enable.
                    </p>
                    <button
                        onClick={() => handleThemeChange('custom')}
                        className={`self-start px-4 py-2 rounded-lg border-2 font-medium transition-colors ${theme === 'custom' ? 'bg-brand-primary text-brand-text-on-primary border-brand-primary' : 'bg-transparent border-brand-border text-brand-text-primary hover:bg-brand-primary-accent/50'}`}
                    >
                        {theme === 'custom' ? 'Custom Theme Active' : 'Enable Custom Colors'}
                    </button>
                    <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-brand-border/50 ${theme !== 'custom' ? 'opacity-50 pointer-events-none' : ''}`}>
                        {colorCustomizationFields.map(field => (
                           <div key={field.id} className="flex flex-col gap-2">
                             <label htmlFor={field.id} className="text-sm font-medium text-brand-text-secondary">{field.name}</label>
                             <div className="relative">
                                 <input
                                     type="color"
                                     id={field.id}
                                     value={hslStringToHex(currentColors[field.id as keyof typeof currentColors])}
                                     onChange={(e) => setCustomColor(field.id as keyof typeof currentColors, e.target.value)}
                                     className="w-full h-10 p-0 bg-brand-surface border-none rounded-md cursor-pointer disabled:cursor-not-allowed"
                                     disabled={theme !== 'custom'}
                                 />
                             </div>
                           </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Settings;
