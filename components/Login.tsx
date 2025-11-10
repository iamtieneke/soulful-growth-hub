
import React, { useState, useEffect } from 'react';
import { useAuth } from './Auth';

const affirmations = [
    "You’re not behind. You’re building roots.",
    "Consistency is quiet power.",
    "Small steps today build tall trees tomorrow.",
    "Your journey is unfolding perfectly.",
];

const onboardingQuestions = [
    { id: 'growth_area', question: "Where are you growing right now?", placeholder: "e.g., Building my community on Instagram..." },
    { id: 'success_feeling', question: "What does success feel like to you?", placeholder: "e.g., Calm, aligned, and financially free..." },
];

const Login: React.FC = () => {
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [affirmation, setAffirmation] = useState('');

    // Signup state
    const [signupStep, setSignupStep] = useState(0); // 0: email, 1: q1, 2: q2
    const [onboardingData, setOnboardingData] = useState<{ [key: string]: string }>({
        growth_area: '',
        success_feeling: '',
    });
    const [isSigningUp, setIsSigningUp] = useState(false);
    
    const { login } = useAuth();

    useEffect(() => {
        setAffirmation(affirmations[Math.floor(Math.random() * affirmations.length)]);
    }, [view]);

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            login(email);
        }
    };
    
    const handleSignupNext = (e: React.FormEvent) => {
        e.preventDefault();
        const currentQuestionId = signupStep > 0 ? onboardingQuestions[signupStep-1].id : '';

        if (signupStep === 0 && email.trim() && email.includes('@')) {
            setSignupStep(1);
        } else if (signupStep > 0 && onboardingData[currentQuestionId]?.trim()) {
            if (signupStep < onboardingQuestions.length + 1) { // Was `onboardingQuestions.length`
                setSignupStep(prev => prev + 1);
            } else {
                 // Final step
                setIsSigningUp(true);
                setTimeout(() => {
                    localStorage.setItem(`soulfulHubOnboarding_${email}`, JSON.stringify(onboardingData));
                    login(email);
                }, 1500);
            }
        }
    };
    
    const handleOnboardingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setOnboardingData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const resetSignup = () => {
        setView('signup');
        setSignupStep(0);
        setEmail('');
        setOnboardingData({ growth_area: '', success_feeling: '' });
    };

    const resetLogin = () => {
        setView('login');
        setEmail('');
    };

    if (isSigningUp) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-brand-background text-brand-text-primary font-sans p-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-brand-surface/90 backdrop-blur-sm rounded-2xl shadow-lg border border-brand-border/30 text-center">
                    <h1 className="text-3xl font-bold text-brand-text-primary">Creating your hub... 🌿</h1>
                    <p className="text-brand-text-secondary animate-pulse">Personalizing your space just for you.</p>
                </div>
            </div>
        );
    }

    if (view === 'signup') {
        const currentQuestion = onboardingQuestions[signupStep - 1];
        const progress = (signupStep / (onboardingQuestions.length + 1)) * 100;

        return (
            <div className="flex items-center justify-center min-h-screen bg-brand-background text-brand-text-primary font-sans p-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-brand-surface/90 backdrop-blur-sm rounded-2xl shadow-lg border border-brand-border/30 text-center">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-brand-text-primary">Let’s begin your growth journey. 🌿</h1>
                        <p className="text-brand-text-secondary">Just a few questions to personalize your space.</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-brand-primary-accent/50 rounded-full h-1.5">
                        <div className="bg-brand-primary h-1.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                    </div>

                    <form onSubmit={handleSignupNext} className="space-y-6">
                        {signupStep === 0 && (
                             <div>
                                <label htmlFor="signup-email" className="sr-only">Email address</label>
                                <input
                                    id="signup-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition placeholder-brand-text-secondary/70"
                                    placeholder="Enter your email address"
                                />
                            </div>
                        )}
                        {signupStep > 0 && currentQuestion && (
                            <div>
                                <label htmlFor={currentQuestion.id} className="block text-lg text-brand-text-primary mb-3">{currentQuestion.question}</label>
                                <textarea
                                    id={currentQuestion.id}
                                    name={currentQuestion.id}
                                    required
                                    value={onboardingData[currentQuestion.id] || ''}
                                    onChange={handleOnboardingChange}
                                    className="w-full px-4 py-3 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition placeholder-brand-text-secondary/70"
                                    placeholder={currentQuestion.placeholder}
                                    rows={3}
                                    autoFocus
                                />
                            </div>
                        )}
                        
                        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-brand-text-on-primary bg-brand-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all">
                            {signupStep <= onboardingQuestions.length ? 'Next' : 'Create My Hub'}
                        </button>
                    </form>
                    <p className="text-sm text-brand-text-secondary">
                        Already have a space?{' '}
                        <button onClick={resetLogin} className="font-medium text-brand-primary hover:underline">
                            Log In
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-background text-brand-text-primary font-sans p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-brand-surface/90 backdrop-blur-sm rounded-2xl shadow-lg border border-brand-border/30 text-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-brand-text-primary">Soulful Hub 🌿</h1>
                    <p className="text-brand-text-secondary">Welcome back, beautiful soul.</p>
                </div>
                
                <p className="text-brand-text-secondary italic text-sm">"{affirmation}"</p>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="login-email" className="sr-only">Email address</label>
                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition placeholder-brand-text-secondary/70"
                            placeholder="Enter your email address"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-brand-text-on-primary bg-brand-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all"
                    >
                        Enter Your Space
                    </button>
                </form>
                 <p className="text-sm text-brand-text-secondary">
                    First time here?{' '}
                    <button onClick={resetSignup} className="font-medium text-brand-primary hover:underline">
                        Create Your Hub
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
