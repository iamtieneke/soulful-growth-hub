
export type Page = 'dashboard' | 'analytics' | 'planner' | 'finance' | 'mentor' | 'mindset' | 'connections' | 'templates' | 'settings' | 'daily-alignment';

export type SocialPlatform = 'Instagram' | 'Threads' | 'TikTok' | 'YouTube' | 'Facebook';
export type StorePlatform = 'Beacon.AI Store' | 'Stan Store';
export type Platform = SocialPlatform | StorePlatform;

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
}

export interface Template {
    id: string;
    title: string;
    content: string;
    type: 'swipe' | 'campaign';
}

export interface Win {
    id: string;
    text: string;
    date: string;
}

export interface DailyLog {
    date: string;
    ratings: {
        branding: number;
        business: number;
        personal: number;
        financial: number;
        mindset: number;
    };
    notes: {
        branding: string;
        business: string;
        personal: string;
        financial: string;
        mindset: string;
    };
    winOfTheDay: string;
}

export interface OnboardingData {
    growth_area: string;
    success_feeling: string;
}

export interface PlatformPerformanceData {
    name: string;
    engagement: number;
    reach: number;
}

export interface AppData {
    analyticsSummary: typeof MOCK_ANALYTICS_SUMMARY;
    growthData: typeof MOCK_GROWTH_DATA;
    platformPerformance: PlatformPerformanceData[];
    financialSummary: { income: number; expenses: number };
    incomeTransactions: Transaction[];
    expenseTransactions: Transaction[];
    customTemplates: Template[];
    calendarNotes: { [day: number]: string };
    wins: Win[];
    connectedPlatforms: { [key in Platform]?: boolean };
    dailyLogs: { [date: string]: DailyLog };
    onboardingData?: OnboardingData;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// MOCK DATA
export const MOCK_ANALYTICS_SUMMARY = {
    totalFollowers: '0k',
    engagementRate: '0%',
    netProfit: '$0',
    highestContentType: 'N/A',
    topPerformingPost: {
        platform: 'N/A',
        type: 'N/A',
        likes: 0,
        comments: 0
    }
};

export const MOCK_UPDATED_ANALYTICS_SUMMARY_SOCIAL = {
    totalFollowers: '10.5k',
    engagementRate: '4.2%',
    netProfit: '$0',
    highestContentType: 'Carousel',
    topPerformingPost: {
        platform: 'Instagram',
        type: 'Carousel',
        likes: 832,
        comments: 102
    }
};

export const MOCK_UPDATED_ANALYTICS_SUMMARY = {
    totalFollowers: '12.8k',
    engagementRate: '4.5%',
    netProfit: '$2,450',
    highestContentType: 'Reel',
    topPerformingPost: {
        platform: 'Instagram',
        type: 'Reel',
        likes: 1204,
        comments: 230
    }
};

export const MOCK_GROWTH_DATA = [
    { name: 'Jan', followers: 400 },
    { name: 'Feb', followers: 600 },
    { name: 'Mar', followers: 900 },
    { name: 'Apr', followers: 1500 },
    { name: 'May', followers: 2300 },
    { name: 'Jun', followers: 3100 },
];

export const MOCK_INITIAL_INCOME_TRANSACTIONS_STORE: Omit<Transaction, 'id' | 'date'>[] = [
    { description: 'Soulful Biz Blueprint', amount: 97, category: 'Products' },
    { description: '1:1 Coaching Session', amount: 250, category: 'Services' },
    { description: 'Digital Planner', amount: 27, category: 'Products' },
];

export const ALL_PLATFORMS_PERFORMANCE: { [key in Platform]: PlatformPerformanceData } = {
    Instagram: { name: 'Instagram', engagement: 4.5, reach: 8200 },
    Threads: { name: 'Threads', engagement: 6.2, reach: 3500 },
    TikTok: { name: 'TikTok', engagement: 8.1, reach: 15000 },
    YouTube: { name: 'YouTube', engagement: 3.9, reach: 6500 },
    Facebook: { name: 'Facebook', engagement: 2.1, reach: 4300 },
    'Beacon.AI Store': { name: 'Beacon.AI Store', engagement: 12.5, reach: 1200 },
    'Stan Store': { name: 'Stan Store', engagement: 15.3, reach: 1800 },
};

export const MOCK_TEMPLATES: Template[] = [
    { id: '1', title: 'The "Gentle Reminder" Carousel', content: `Slide 1: [Bold Statement/Question]\nExample: "You don't need another productivity hack."\n\nSlide 2: [Elaborate on the problem]\nExample: "You need permission to rest. Hustle culture taught us that our worth is in our work, but that's a lie."\n\nSlide 3: [Introduce the solution/mindset shift]\nExample: "What if rest wasn't the reward, but the foundation?"\n\nSlide 4: [Give 3 actionable tips]\nExample: \n1. Schedule 15 mins of "do nothing" time.\n2. Define your "enough" point for the day.\n3. Celebrate the small wins, not just the big launches.\n\nSlide 5: [Call to Action/Engagement]\nExample: "How are you embracing rest this week? Share below. 🌿"`, type: 'swipe' },
    { id: '2', title: 'The "Value Bomb" Reel Hook', content: `Hook: "Stop selling your offer and start selling the feeling."\n\nVisual: You looking thoughtfully at the camera.\n\nText on screen: \n- Not this: "Buy my course on sales funnels."\n- This: "Imagine waking up to sales notifications and feeling calm, not chaotic."\n\nCaption: "People don't buy products, they buy transformations. They buy feelings. Instead of listing features, talk about the peace of mind, the confidence, the freedom your offer provides. What feeling does your offer create? Let me know 👇"`, type: 'swipe' },
    { id: '3', title: 'Soulful Product Launch Email Sequence', content: `Email 1: The "I see you" Email (Pain Point)\nSubject: Feeling [common pain point]?\nBody: Connect with their struggle. Share a personal story. Don't mention your offer yet. End with a question.\n\nEmail 2: The "What if?" Email (Possibility)\nSubject: What if [desired outcome] was possible?\nBody: Paint a picture of the transformation. Hint that you've found a way. \n\nEmail 3: The Big Reveal (Offer)\nSubject: Your invitation to [Your Offer Name]\nBody: Introduce your offer. Focus on benefits, not just features. Who is it for? What will they achieve?\n\nEmail 4: Overcoming Objections (FAQ)\nSubject: Your questions about [Your Offer Name], answered.\nBody: Address common fears and doubts (time, money, self-doubt) with empathy.\n\nEmail 5: Last Call (Urgency)\nSubject: Doors closing tonight for [Your Offer Name]\nBody: Gentle but firm last call. Remind them of the transformation. Add a bonus if you have one.`, type: 'campaign' },
];
