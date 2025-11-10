
import React, { useState, useCallback, createContext, useContext, ReactNode, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Planner from './components/Planner';
import Finance from './components/Finance';
import Mentor from './components/Mentor';
import Mindset from './components/Mindset';
import Connections from './components/Connections';
import Templates from './components/Templates';
import Settings from './components/Settings';
import DailyAlignment from './components/DailyAlignment';
import Login from './components/Login';
import { AuthProvider, useAuth } from './components/Auth';
import { ThemeProvider } from './components/ThemeProvider';
import { Page, AppData, Transaction, Template, Win, Platform, DailyLog, MOCK_ANALYTICS_SUMMARY, MOCK_GROWTH_DATA, ALL_PLATFORMS_PERFORMANCE, MOCK_INITIAL_INCOME_TRANSACTIONS_STORE, MOCK_UPDATED_ANALYTICS_SUMMARY, MOCK_UPDATED_ANALYTICS_SUMMARY_SOCIAL } from './types';
import { MenuIcon, UserCircleIcon } from './components/Icons';

// --- Data Context Logic ---

interface DataContextType {
    appData: AppData;
    isSyncing: boolean;
    syncData: () => Promise<void>;
    addIncome: (income: Omit<Transaction, 'id' | 'date'>) => void;
    addExpense: (expense: Omit<Transaction, 'id' | 'date'>) => void;
    addTemplate: (template: Omit<Template, 'id'>) => void;
    updateCalendarNote: (day: number, note: string) => void;
    addNoteForToday: (note: string) => void;
    addWin: (winText: string) => void;
    connectPlatform: (platform: Platform) => void;
    disconnectPlatform: (platform: Platform) => void;
    saveDailyLog: (log: DailyLog) => void;
}

const getInitialData = (): Omit<AppData, 'connectedPlatforms' | 'onboardingData'> => ({
    analyticsSummary: MOCK_ANALYTICS_SUMMARY,
    growthData: MOCK_GROWTH_DATA,
    platformPerformance: [],
    financialSummary: { income: 0, expenses: 0 },
    incomeTransactions: [],
    expenseTransactions: [],
    customTemplates: [],
    calendarNotes: { '15': 'Start the big launch! ✨' },
    wins: [],
    dailyLogs: {},
});


const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [appData, setAppData] = useState<AppData | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const dataKey = `soulfulHubData_v5_${currentUser}`;

    useEffect(() => {
        if (currentUser) {
            const storedData = localStorage.getItem(dataKey);
            let finalData: AppData;

            if (storedData) {
                const parsedData = JSON.parse(storedData);
                // Ensure new fields exist
                finalData = {
                    ...getInitialData(),
                    ...parsedData,
                };
            } else {
                finalData = {
                    ...getInitialData(),
                    connectedPlatforms: {},
                };
            }
            
            const storedOnboardingData = localStorage.getItem(`soulfulHubOnboarding_${currentUser}`);
            if (storedOnboardingData) {
                try {
                    finalData.onboardingData = JSON.parse(storedOnboardingData);
                } catch(e) {
                    console.error("Failed to parse onboarding data", e);
                }
            }
            
            setAppData(finalData);

            if (!storedData) {
                localStorage.setItem(dataKey, JSON.stringify(finalData));
            }
        }
    }, [currentUser, dataKey]);
    
    const updateAndStoreData = (newData: AppData) => {
        setAppData(newData);
        localStorage.setItem(dataKey, JSON.stringify(newData));
    }

    const connectPlatform = (platform: Platform) => {
        if (!appData) return;

        const isFirstConnection = Object.keys(appData.connectedPlatforms).length === 0;
        let newData = { ...appData };
        const updatedConnections = { ...newData.connectedPlatforms, [platform]: true };

        // Add the new platform's performance data
        const platformPerformanceData = ALL_PLATFORMS_PERFORMANCE[platform];
        if (platformPerformanceData) {
            newData.platformPerformance = [...newData.platformPerformance, platformPerformanceData];
        }

        // If it's a store platform, add income and update summary analytics
        if (platform.includes('Store')) {
            const newIncomeTransactions = MOCK_INITIAL_INCOME_TRANSACTIONS_STORE.map((t, i) => ({
                ...t,
                id: `${platform.replace(/\s/g, '')}-${Date.now()}-${i}`,
                date: new Date().toISOString().split('T')[0],
            }));
            
            const allIncome = [...newIncomeTransactions, ...newData.incomeTransactions];
            const totalIncome = allIncome.reduce((sum, t) => sum + t.amount, 0);
            
            newData = {
                ...newData,
                analyticsSummary: MOCK_UPDATED_ANALYTICS_SUMMARY, // Update summary
                incomeTransactions: allIncome,
                financialSummary: { ...newData.financialSummary, income: totalIncome },
            };
        } 
        // If it's a social platform and the first connection, just update summary to move out of empty state
        else if (isFirstConnection) {
            newData.analyticsSummary = MOCK_UPDATED_ANALYTICS_SUMMARY_SOCIAL;
        }
        
        newData.connectedPlatforms = updatedConnections;
        updateAndStoreData(newData);
    };

    const disconnectPlatform = (platform: Platform) => {
        if (!appData) return;

        const updatedConnections = { ...appData.connectedPlatforms };
        delete updatedConnections[platform];

        let newData = { ...appData, connectedPlatforms: updatedConnections };

        // Remove the platform's performance data
        newData.platformPerformance = newData.platformPerformance.filter(p => p.name !== platform);

        // If it was a store, remove its associated income transactions
        if (platform.includes('Store')) {
            const platformId = platform.replace(/\s/g, '');
            const remainingIncome = newData.incomeTransactions.filter(t => !t.id.startsWith(platformId));
            const newTotalIncome = remainingIncome.reduce((sum, t) => sum + t.amount, 0);
            newData.incomeTransactions = remainingIncome;
            newData.financialSummary = { ...newData.financialSummary, income: newTotalIncome };
        }

        // If it was the LAST platform disconnected, reset to initial state
        if (Object.keys(updatedConnections).length === 0) {
            const initialData = getInitialData();
            newData = {
                ...appData, // Keep custom stuff like expenses, notes, etc.
                connectedPlatforms: {},
                analyticsSummary: initialData.analyticsSummary,
                platformPerformance: initialData.platformPerformance,
                growthData: initialData.growthData,
                incomeTransactions: [], // Reset all income
                financialSummary: { ...appData.financialSummary, income: 0 },
            };
        }
        
        updateAndStoreData(newData);
    };

    const addIncome = (income: Omit<Transaction, 'id' | 'date'>) => {
        if (!appData) return;
        const newTransaction: Transaction = {
            ...income,
            id: `manual-${Date.now().toString()}`,
            date: new Date().toISOString().split('T')[0],
        };
        const updatedTransactions = [newTransaction, ...appData.incomeTransactions];
        const totalIncome = updatedTransactions.reduce((sum, t) => sum + t.amount, 0);

        const newData = {
            ...appData,
            incomeTransactions: updatedTransactions,
            financialSummary: { ...appData.financialSummary, income: totalIncome },
        };
        updateAndStoreData(newData);
    };

    const addExpense = (expense: Omit<Transaction, 'id' | 'date'>) => {
        if (!appData) return;
        const newTransaction: Transaction = {
            ...expense,
            id: Date.now().toString(),
            date: new Date().toISOString().split('T')[0],
        };
        const updatedTransactions = [newTransaction, ...appData.expenseTransactions];
        const totalExpenses = updatedTransactions.reduce((sum, t) => sum + t.amount, 0);

        const newData = {
            ...appData,
            expenseTransactions: updatedTransactions,
            financialSummary: { ...appData.financialSummary, expenses: totalExpenses },
        };
        updateAndStoreData(newData);
    };

    const addTemplate = (template: Omit<Template, 'id'>) => {
        if (!appData) return;
        const newTemplate: Template = { ...template, id: Date.now().toString() };
        const updatedTemplates = [...appData.customTemplates, newTemplate];
        const newData = { ...appData, customTemplates: updatedTemplates };
        updateAndStoreData(newData);
    };

    const updateCalendarNote = (day: number, note: string) => {
        if (!appData) return;
        const updatedNotes = { ...appData.calendarNotes };
        if (note.trim() === '') {
            delete updatedNotes[day];
        } else {
            updatedNotes[day] = note;
        }
        const newData = { ...appData, calendarNotes: updatedNotes };
        updateAndStoreData(newData);
    };
    
    const addNoteForToday = (note: string) => {
        if (!appData) return;
        const today = new Date().getDate();
        const existingNote = appData.calendarNotes[today] || '';
        // Add new note to the top for visibility
        const newNote = existingNote ? `- ${note}\n${existingNote}` : `- ${note}`;
        updateCalendarNote(today, newNote);
    };

    const addWin = (winText: string) => {
        if (!appData || !currentUser) return;
        const newWin: Win = {
            id: Date.now().toString(),
            text: winText,
            date: new Date().toISOString(),
        };
        const updatedWins = [newWin, ...appData.wins];
        updateAndStoreData({ ...appData, wins: updatedWins });
    };

    const saveDailyLog = (log: DailyLog) => {
        if (!appData) return;
        
        const updatedLogs = {
            ...appData.dailyLogs,
            [log.date]: log,
        };
        updateAndStoreData({ ...appData, dailyLogs: updatedLogs });
    };

    const syncData = useCallback(async () => {
        if (!appData) return;
        setIsSyncing(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        // In a real app, this would fetch new data. For now, we simulate a small change.
        const updatedSummary = { 
            ...appData.analyticsSummary,
            totalFollowers: (parseFloat(appData.analyticsSummary.totalFollowers) + 0.1).toFixed(1) + 'k'
        };
        updateAndStoreData({ ...appData, analyticsSummary: updatedSummary });
        setIsSyncing(false);
    }, [appData]);

    if (!appData) {
        return <div className="flex h-screen w-screen items-center justify-center bg-brand-background"><p>Loading your space...</p></div>;
    }

    return (
        <DataContext.Provider value={{ appData, isSyncing, syncData, addIncome, addExpense, addTemplate, updateCalendarNote, addNoteForToday, addWin, connectPlatform, disconnectPlatform, saveDailyLog }}>
            {children}
        </DataContext.Provider>
    );
};

// --- App Component ---

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout, profilePic, name } = useAuth();

  const handleSetPage = (page: Page) => {
    setCurrentPage(page);
    setIsSidebarOpen(false); // Close sidebar on navigation
    setIsProfileMenuOpen(false); // Close menu on navigation
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
            setIsProfileMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const renderPage = useCallback(() => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard setPage={handleSetPage} />;
      case 'analytics':
        return <Analytics />;
      case 'planner':
        return <Planner />;
      case 'finance':
        return <Finance />;
      case 'mentor':
        return <Mentor />;
      case 'mindset':
        return <Mindset />;
      case 'daily-alignment':
        return <DailyAlignment />;
      case 'connections':
        return <Connections />;
      case 'templates':
        return <Templates />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard setPage={handleSetPage} />;
    }
  }, [currentPage]);

  const pageTitles: { [key in Page]: string } = {
    dashboard: 'Dashboard',
    analytics: 'Analytics & Insights',
    planner: 'Growth Planner',
    finance: 'Income & Expenses',
    mentor: 'AI Mentor',
    mindset: 'Mindset & Reflection',
    'daily-alignment': 'Daily Alignment',
    connections: 'Platform Connections',
    templates: 'Templates & Resources',
    settings: 'Settings & Customization',
  };

  return (
    <div className="flex h-screen bg-brand-background text-brand-text-primary font-sans">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={handleSetPage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-brand-surface/80 backdrop-blur-sm border-b border-brand-border/50">
           <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="lg:hidden p-2 text-brand-text-primary rounded-md hover:bg-brand-primary-accent/50 transition-colors"
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-brand-text-primary lg:hidden">
              {pageTitles[currentPage]}
            </h1>
           </div>
          <div ref={profileMenuRef} className="relative">
             <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="flex items-center gap-2 p-1 rounded-full hover:bg-brand-primary-accent/50 transition-colors" aria-expanded={isProfileMenuOpen} aria-haspopup="true">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-brand-text-secondary" />
                )}
                <span className="hidden md:block text-sm text-brand-text-secondary">{name}</span>
             </button>
             {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-brand-surface rounded-md shadow-lg py-1 z-50 border border-brand-border/30" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-sm text-brand-text-primary border-b border-brand-border/30 truncate" role="none">{currentUser}</div>
                    <button onClick={() => handleSetPage('settings')} className="w-full text-left block px-4 py-2 text-sm text-brand-text-primary hover:bg-brand-background" role="menuitem">Settings</button>
                    <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50" role="menuitem">Logout</button>
                </div>
             )}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderPage()}
        </div>
      </main>
    </div>
  );
};

const AppContainer: React.FC = () => {
    const { currentUser } = useAuth();
    
    if (!currentUser) {
        return <Login />;
    }

    return (
        <DataProvider>
            <AppContent />
        </DataProvider>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContainer />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
