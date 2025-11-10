
import React, { useState } from 'react';
import Card from './Card';
import { InstagramIcon, TikTokIcon, YouTubeIcon, FacebookIcon, ThreadsIcon, StorefrontIcon, XIcon } from './Icons';
import { useData } from '../App';
import { SocialPlatform, StorePlatform, Platform } from '../types';

const platformConfig: { [key in Platform]: { icon: React.FC<React.SVGProps<SVGSVGElement>>, color: string } } = {
    Instagram: { icon: InstagramIcon, color: 'text-pink-500' },
    Threads: { icon: ThreadsIcon, color: 'text-brand-text-primary' },
    TikTok: { icon: TikTokIcon, color: 'text-brand-text-primary' },
    YouTube: { icon: YouTubeIcon, color: 'text-red-600' },
    Facebook: { icon: FacebookIcon, color: 'text-blue-600' },
    'Beacon.AI Store': { icon: StorefrontIcon, color: 'text-teal-600' },
    'Stan Store': { icon: StorefrontIcon, color: 'text-indigo-600' },
};

const ConnectionRow: React.FC<{ 
    platform: Platform;
    isConnected: boolean;
    onConnect: (platform: Platform, username: string) => void;
    onDisconnect: (platform: Platform) => void;
    onSync: () => Promise<void>;
}> = ({ platform, isConnected, onConnect, onDisconnect, onSync }) => {
    const { isSyncing } = useData();
    const [username, setUsername] = useState('');
    const [isLocalSyncing, setIsLocalSyncing] = useState(false);
    const { icon: Icon, color } = platformConfig[platform];

    const handleAction = async () => {
        if (!isConnected) {
            onConnect(platform, username.trim() || 'yourstore'); // Pass username or default for stores
        } else if (isConnected) {
            setIsLocalSyncing(true);
            await onSync();
            setIsLocalSyncing(false);
        }
    };

    const isSyncingThisRow = isSyncing && isLocalSyncing;
    const isStore = platform.includes('Store');
    const placeholderText = isStore ? 'yourstore' : '@username';
    const connectedText = isStore ? `Connected` : `Connected`; // Simplified display


    return (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-brand-border/30 last:border-b-0">
            <div className="flex items-center gap-4 mb-4 sm:mb-0 mr-auto">
                <Icon className={`w-8 h-8 ${color}`} />
                <span className="text-lg font-medium text-brand-text-primary">{platform}</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                {isConnected ? (
                    <>
                        <p className="text-brand-text-secondary flex-grow sm:flex-grow-0">{connectedText}</p>
                        <button 
                            onClick={handleAction}
                            disabled={isSyncing}
                            className="bg-brand-primary text-brand-text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:bg-brand-text-secondary/50 disabled:cursor-not-allowed text-sm font-medium w-28 text-center"
                        >
                            {isSyncingThisRow ? 'Syncing...' : 'Sync Data'}
                        </button>
                        <button 
                            onClick={() => onDisconnect(platform)}
                            disabled={isSyncing}
                            className="bg-brand-border/50 text-brand-text-primary px-4 py-2 rounded-lg hover:bg-brand-border transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Disconnect
                        </button>
                    </>
                ) : (
                    <>
                        {!isStore && <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAction()}
                            placeholder={placeholderText}
                            className="flex-1 w-full sm:w-48 p-2 bg-brand-surface border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                            disabled={isSyncing}
                        />}
                        <button 
                            onClick={handleAction}
                            disabled={(!username.trim() && !isStore) || isSyncing}
                            className="bg-brand-primary text-brand-text-on-primary px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:bg-brand-text-secondary/50 disabled:cursor-not-allowed text-sm font-medium w-28 text-center"
                        >
                            {isSyncingThisRow ? 'Syncing...' : 'Connect'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const LoginModal: React.FC<{ 
    platform: StorePlatform;
    onClose: () => void;
    onLogin: (platform: StorePlatform) => void;
}> = ({ platform, onClose, onLogin }) => {
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setTimeout(() => {
            onLogin(platform);
            onClose();
        }, 1500); // Simulate network request
    }

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface rounded-xl shadow-lg w-full max-w-sm p-8 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-brand-text-secondary hover:text-brand-text-primary">
              <XIcon className="w-6 h-6" />
            </button>
            <div className="text-center">
                <h3 className="text-xl font-semibold text-brand-text-primary mb-2">Connect to {platform}</h3>
                <p className="text-brand-text-secondary mb-6">Enter your credentials to connect.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brand-text-secondary mb-1 text-left">Email</label>
                    <input type="email" id="email" required className="w-full p-2 bg-brand-background border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition" defaultValue="hello@soulfulcreator.co" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-brand-text-secondary mb-1 text-left">Password</label>
                    <input type="password" id="password" required className="w-full p-2 bg-brand-background border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition" defaultValue="password" />
                </div>
                 <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-brand-primary text-brand-text-on-primary py-2.5 rounded-lg hover:opacity-90 transition-all disabled:bg-brand-text-secondary/50"
                 >
                    {isLoggingIn ? 'Connecting...' : 'Securely Connect'}
                </button>
            </form>
          </div>
        </div>
    )
}

const Connections: React.FC = () => {
    const socialPlatforms: SocialPlatform[] = ['Instagram', 'Threads', 'TikTok', 'YouTube', 'Facebook'];
    const storePlatforms: StorePlatform[] = ['Beacon.AI Store', 'Stan Store'];
    
    const [loginModalPlatform, setLoginModalPlatform] = useState<StorePlatform | null>(null);
    const { appData, syncData, connectPlatform, disconnectPlatform } = useData();

    const handleConnect = (platform: Platform) => {
        if (platform.includes('Store')) {
            setLoginModalPlatform(platform as StorePlatform);
        } else {
            connectPlatform(platform);
        }
    };
    
    const handleLoginSuccess = (platform: StorePlatform) => {
        connectPlatform(platform);
    };

    const handleDisconnect = (platform: Platform) => {
        disconnectPlatform(platform);
    };
    
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {loginModalPlatform && (
                <LoginModal 
                    platform={loginModalPlatform}
                    onClose={() => setLoginModalPlatform(null)}
                    onLogin={handleLoginSuccess}
                />
            )}
            <div>
                <h1 className="text-3xl font-bold text-brand-text-primary">Connect Your Platforms</h1>
                <p className="text-brand-text-secondary mt-2">Link your accounts to get personalized analytics and AI-powered insights. 🌿</p>
            </div>

            <Card title="Social Media Connections" className="!p-0 overflow-hidden">
                <div>
                    {socialPlatforms.map(platform => (
                        <ConnectionRow 
                            key={platform} 
                            platform={platform} 
                            isConnected={!!appData.connectedPlatforms[platform]}
                            onConnect={handleConnect}
                            onDisconnect={handleDisconnect}
                            onSync={syncData}
                        />
                    ))}
                </div>
            </Card>

            <Card title="Store Connectors" className="!p-0 overflow-hidden">
                <div>
                    {storePlatforms.map(platform => (
                        <ConnectionRow 
                            key={platform} 
                            platform={platform} 
                            isConnected={!!appData.connectedPlatforms[platform]}
                            onConnect={handleConnect}
                            onDisconnect={handleDisconnect}
                            onSync={syncData}
                        />
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Connections;
