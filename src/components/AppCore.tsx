import { useEffect, useState, ReactNode } from "react";
import { supabase } from '../services/supabase';
import { checkUserPremium } from '../services/premium';
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

export function AppCore({
  userId,
  onLogout,
  showNav = true,
  currentUser
}: AppCoreProps) {

  const [activeTab, setActiveTab] = useState("feed");
  const [navParams, setNavParams] = useState<Record<string, unknown> | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const isAdmin =
    currentUser?.plan === 'admin' ||
    currentUser?.plan === 'owner' ||
    currentUser?.plan === 'moderator';

  useEffect(() => {
    async function loadPremium() {
      if (!userId) {
        setIsPremium(false);
        return;
      }

      if (isAdmin) {
        setIsPremium(true);
        return;
      }

      const premium = await checkUserPremium(userId);

      console.log("PREMIUM CHECK:", userId, premium);

      setIsPremium(premium);
    }

    loadPremium();
  }, [userId, isAdmin]);

  const navigate = (tab: string, params?: any) => {
    setActiveTab(tab);
    setNavParams(params || null);
  };

  const activatePremium = async () => {
    if (!userId) return;

    const planId = '29105ff8-818b-4876-b6da-f1039e752f6c';

    const { error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        expires_at: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString()
      });

    if (error) {
      console.error("Erro ao ativar Premium:", error);
      return;
    }

    window.location.reload();
  };

  return (
    <AppShell>

      <SecurityWatermark
        currentUser={currentUser}
        local={false}
      />

      <HeaderGlobal
        onSearchClick={() => navigate('radar')}
        onEnergyClick={() => setShowPixModal(true)}
        onSettingsClick={() => navigate('settings')}
        onNotificationsClick={() => navigate('invites')}
      />

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

      {showNav && activeTab !== 'chat' && (
        <div className="flex-none bg-[var(--libido-bg)] border-t border-[var(--libido-border)] relative z-50">

          <BottomNavGlobal
            activeTab={activeTab}
            onTabChange={(tab) => navigate(tab)}
            isAdmin={isAdmin}
          />

        </div>
      )}

      <PixCheckout
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        onUpgrade={async () => {
          await activatePremium();
          setShowPixModal(false);
        }}
        userId={userId}
      />

    </AppShell>
  );
}