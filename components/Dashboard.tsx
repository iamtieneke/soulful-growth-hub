
import React, { useState } from 'react';
import Card from './Card';
import { useData } from '../App';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Page } from '../types';
import { LinkIcon } from './Icons';
import { useAuth } from './Auth';

const WinsTracker: React.FC = () => {
    const { appData, addWin } = useData();
    const [winText, setWinText] = useState('');

    const handleAddWin = (e: React.FormEvent) => {
        e.preventDefault();
        if (winText.trim()) {
            addWin(winText);
            setWinText('');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <form onSubmit={handleAddWin} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={winText}
                    onChange={e => setWinText(e.target.value)}
                    placeholder="e.g., Hit 10k followers!"
                    className="flex-1 w-full p-2 bg-brand-background border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                />
                <button type="submit" className="bg-brand-primary text-brand-text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition-all font-medium">Add</button>
            </form>
            <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                {appData.wins.slice(0, 5).map(win => (
                    <div key={win.id} className="p-2 bg-brand-background rounded-md text-sm text-brand-text-secondary animate-fade-in">
                        ✨ {win.text}
                    </div>
                ))}
                {appData.wins.length === 0 && <p className="text-sm text-brand-text-secondary text-center py-4">Log your first win!</p>}
            </div>
        </div>
    );
}


const Dashboard: React.FC<{ setPage: (page: Page) => void }> = ({ setPage }) => {
    const { appData } = useData();
    const { name } = useAuth();
    const { analyticsSummary, growthData, financialSummary, incomeTransactions, expenseTransactions } = appData;
    const netProfit = financialSummary.income - financialSummary.expenses;
    
    // Show empty state if user has no financial transactions yet and no connected platforms
    const isNewUser = incomeTransactions.length === 0 && expenseTransactions.length === 0 && Object.keys(appData.connectedPlatforms).length === 0;

    if (isNewUser) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="max-w-md">
                    <h1 className="text-4xl font-bold text-brand-text-primary">Welcome, {name}. ✨</h1>
                    <p className="text-brand-text-secondary mt-4 text-lg">Your Soulful Hub is ready for you.</p>
                    <p className="text-brand-text-secondary mt-2">Connect a platform or add your first financial entry to bring your dashboard to life.</p>
                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        <button onClick={() => setPage('connections')} className="flex items-center justify-center gap-2 bg-brand-primary text-brand-text-on-primary px-6 py-3 rounded-lg hover:opacity-90 transition-all font-semibold">
                            <LinkIcon className="w-5 h-5" />
                            Connect a Platform
                        </button>
                         <button onClick={() => setPage('finance')} className="bg-brand-primary-accent text-brand-text-primary px-6 py-3 rounded-lg hover:bg-brand-primary-accent/80 transition-colors font-semibold">
                            Add Income/Expense
                        </button>
                    </div>
                </div>
            </div>
        )
    }
    
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-text-primary">Welcome back, {name}. ✨</h1>
        <p className="text-brand-text-secondary mt-2">Here’s your growth at a glance. Quiet roots are building steady power.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Total Followers">
            <p className="text-4xl font-bold text-brand-text-primary">{analyticsSummary.totalFollowers}</p>
            <p className="text-sm text-green-600">+5.2% this week</p>
        </Card>
        <Card title="Engagement Rate">
            <p className="text-4xl font-bold text-brand-text-primary">{analyticsSummary.engagementRate}</p>
            <p className="text-sm text-green-600">+0.3% this week</p>
        </Card>
        <Card title="Net Profit (This Month)">
            <p className={`text-4xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${netProfit.toLocaleString()}</p>
            <p className="text-sm text-brand-text-secondary">All time</p>
        </Card>
        <Card title="Top Content Type">
            <p className="text-4xl font-bold text-brand-text-primary">{analyticsSummary.highestContentType}</p>
            <p className="text-sm text-brand-text-secondary">Keep creating these!</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card title="Visual Growth Meter">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid stroke="hsl(var(--color-border))" strokeDasharray="3 3" strokeOpacity={0.5} />
                    <XAxis dataKey="name" stroke="hsl(var(--color-text-secondary))" />
                    <YAxis stroke="hsl(var(--color-text-secondary))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--color-surface))', borderColor: 'hsl(var(--color-primary))', color: 'hsl(var(--color-text-primary))' }}/>
                    <Line type="monotone" dataKey="followers" stroke="hsl(var(--color-primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--color-primary))' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
        </div>
        <div className="space-y-6">
            <Card title="Weekly Wins ✨">
                <div className="h-48">
                    <WinsTracker />
                </div>
            </Card>
            <Card title="Top Performing Post">
                <div className="space-y-2">
                    <p className="text-lg font-semibold text-brand-text-primary">{analyticsSummary.topPerformingPost.type} on {analyticsSummary.topPerformingPost.platform}</p>
                    <p><span className="font-medium">{analyticsSummary.topPerformingPost.likes}</span> Likes</p>
                    <p><span className="font-medium">{analyticsSummary.topPerformingPost.comments}</span> Comments</p>
                    <a href="#" className="text-brand-primary hover:underline">View Post</a>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
