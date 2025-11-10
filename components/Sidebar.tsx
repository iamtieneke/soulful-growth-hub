
import React from 'react';
import { Page } from '../types';
import { HomeIcon, ChartBarIcon, CalendarIcon, CurrencyDollarIcon, SparklesIcon, XIcon, LinkIcon, CollectionIcon, HeartIcon, BookOpenIcon } from './Icons';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, setIsOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
    { id: 'connections', label: 'Connections', icon: LinkIcon },
    { id: 'planner', label: 'Planner', icon: CalendarIcon },
    { id: 'finance', label: 'Finance', icon: CurrencyDollarIcon },
    { id: 'mentor', label: 'AI Mentor', icon: SparklesIcon },
    { id: 'mindset', label: 'Mindset', icon: HeartIcon },
    { id: 'daily-alignment', label: 'Daily Alignment', icon: BookOpenIcon },
    { id: 'templates', label: 'Templates', icon: CollectionIcon },
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/30 z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>
      <aside className={`absolute lg:relative z-40 flex flex-col h-full bg-brand-surface border-r border-brand-border/50 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64`}>
        <div className="flex items-center justify-between p-4 border-b border-brand-border/50">
          <h1 className="text-2xl font-bold text-brand-text-primary">Soulful Hub 🌿</h1>
          <button 
            onClick={() => setIsOpen(false)} 
            className="lg:hidden p-1 text-brand-text-primary rounded-md hover:bg-brand-primary-accent/50 transition-colors"
            aria-label="Close sidebar"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                    setCurrentPage(item.id as Page);
                    setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-primary-accent text-brand-text-primary font-semibold shadow-sm'
                    : 'text-brand-text-secondary hover:bg-brand-primary-accent/70 hover:text-brand-text-primary'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t border-brand-border/50">
           <div className="p-4 rounded-lg bg-brand-background text-center">
                <p className="text-sm text-brand-text-secondary">"Small roots today build tall trees tomorrow."</p>
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
