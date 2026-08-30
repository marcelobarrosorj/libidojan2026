**codeTsx**

```
import { updateUserProfile } from '../services/users';
import { useState, ReactNode } from "react";
import { AppShell } from "./AppShell";
import { HeaderGlobal } from "./HeaderGlobal";
import { BottomNavGlobal } from "./BottomNavGlobal";
import { ContentRouter } from "./ContentRouter";
import { PixCheckout } from "./PixCheckout";
import { User } from '../types';
import { SecurityWatermark } from './SecurityWatermark';

interface AppCoreProps {
  userId?: string;
  onLogout?: () => void;
  showNav?: boolean;
  children?: ReactNode;
  currentUser?: User | null; 
}

export function AppCore({ userId, onLogout, showNav = true, children, currentUser }: AppCoreProps) {
  const [activeTab, setActiveTab] = useState("feed");
  const [navParams, setNavParams] = useState<Record<string, unknown> | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);

  const isPremium = 
    currentUser?.plan === 'premium' || 
    currentUser?.plan === 'admin' || currentUser?.plan === 'owner' ||
    currentUser?.role === 'admin' || currentUser?.role === 'owner';
    
  const isAdmin = 
    currentUser?.plan === 'admin' || currentUser?.plan === 'owner' || currentUser?.plan === 'moderator' ||
    currentUser?.role === 'admin' || currentUser?.role === 'owner' || currentUser?.role === 'moderator';

  const navigate = (tab: string, params?: any) => {
    setActiveTab(tab);
    setNavParams(params || null);
  };

  return (
    <AppShell>
      <SecurityWatermark currentUser={currentUser} local={false} />

      {/* 1. Header Global no topo */}
      <HeaderGlobal 
        onSearchClick={() => navigate('radar')}
        onEnergyClick={() => setShowPixModal(true)}
        onSettingsClick={() => navigate('settings')}
        onNotificationsClick={() => navigate('invites')}
      />



      {/* 3. Conteúdo da página abaixo da barra */}
      <ContentRouter 
        activeTab={activeTab} 
        navParams={navParams}
        navigate={navigate}
        isPremium={isPremium} 
        isAdmin={isAdmin}
        onShowPremiumModal={() => setShowPixModal(true)}
        userId={userId}
        onLogout={onLogout}
        currentUser={currentUser}
      />

      {/* 4. Barra de Navegação no rodapé */}
      {showNav && (
        <div className="flex-none bg-[var(--libido-bg)] border-t border-[var(--libido-border)] relative z-50">
          <BottomNavGlobal activeTab={activeTab} onTabChange={(tab) => navigate(tab)} isAdmin={isAdmin} />
        </div>
      )}

      <PixCheckout 
        isOpen={showPixModal} 
        onClose={() => setShowPixModal(false)} 
        onUpgrade={async () => {
          if (currentUser?.id) {
            await updateUserProfile(currentUser.id, { plan: 'premium' });
            window.location.reload(); // Reload to reflect changes globally
          }
          setShowPixModal(false);
        }} 
        userId={userId}
      />
    </AppShell>
  );
}
```