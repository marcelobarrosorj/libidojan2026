import { updateUserProfile } from '../services/users';
import { useEffect, useState, ReactNode } from "react";
import { AppShell } from "./AppShell";
import { HeaderGlobal } from "./HeaderGlobal";
import { BottomNavGlobal } from "./BottomNavGlobal";
import { ContentRouter } from "./ContentRouter";
import { PixCheckout } from "./PixCheckout";
import { User } from '../types';
import { SecurityWatermark } from './SecurityWatermark';
import { checkUserPremium } from '../services/premium';

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
  children,
  currentUser
}: AppCoreProps) {
  const [activeTab, setActiveTab] = useState("feed");
  const [navParams, setNavParams] = useState<Record<string, unknown> | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [premiumChecked, setPremiumChecked] = useState(false);

  const userPlan = String(currentUser?.plan || '').trim().toLowerCase();
  const userRole = String(currentUser?.role || '').trim().toLowerCase();

  const isOwner = userPlan === 'owner' || userRole === 'owner';

  const isPremium =
    isOwner ||
    hasActiveSubscription ||
    userPlan === 'premium' ||
    userPlan === 'admin' ||
    userRole === 'admin';

  const isAdmin =
    isOwner ||
    userPlan === 'admin' ||
    userPlan === 'moderator' ||
    userRole === 'admin' ||
    userRole === 'moderator';

  useEffect(() => {
    let isMounted = true;

    const loadPremiumStatus = async () => {
      // Owner nunca depende de consulta de assinatura e nunca deve ver checkout.
      if (isOwner) {
        if (isMounted) {
          setHasActiveSubscription(true);
          setPremiumChecked(true);
          setShowPixModal(false);
        }
        return;
      }

      if (!userId) {
        if (isMounted) {
          setHasActiveSubscription(false);
          setPremiumChecked(true);
        }
        return;
      }

      setPremiumChecked(false);

      const premium = await checkUserPremium(userId);

      if (isMounted) {
        setHasActiveSubscription(premium);
        setPremiumChecked(true);
      }
    };

    void loadPremiumStatus();

    return () => {
      isMounted = false;
    };
  }, [userId, isOwner]);

  useEffect(() => {
    // ProteÃ§Ã£o extra: caso seja Owner, fecha imediatamente qualquer checkout aberto.
    if (isOwner) {
      setShowPixModal(false);
    }
  }, [isOwner]);

  const openPremiumCheckout = () => {
    // Owner, admin e usuÃ¡rios Premium nÃ£o podem abrir cobranÃ§a.
    if (isOwner || isPremium || !premiumChecked) {
      return;
    }

    setShowPixModal(true);
  };

  const navigate = (tab: string, params?: any) => {
    setActiveTab(tab);
    setNavParams(params || null);
  };

  return (
    <AppShell>
      <SecurityWatermark currentUser={currentUser} local={false} />

      <HeaderGlobal
        onSearchClick={() => navigate('radar')}
        onEnergyClick={openPremiumCheckout}
        onSettingsClick={() => navigate('settings')}
        onNotificationsClick={() => navigate('invites')}
      />

      <ContentRouter
        activeTab={activeTab}
        navParams={navParams}
        navigate={navigate}
        isPremium={isPremium}
        isAdmin={isAdmin}
        onShowPremiumModal={openPremiumCheckout}
        userId={userId}
        onLogout={onLogout}
        currentUser={currentUser}
      />

      {showNav && (
        <div className="flex-none bg-[var(--libido-bg)] border-t border-[var(--libido-border)] relative z-50">
          <BottomNavGlobal
            activeTab={activeTab}
            onTabChange={(tab) => navigate(tab)}
            isAdmin={isAdmin}
          />
        </div>
      )}

      <PixCheckout
        isOpen={showPixModal && !isPremium && !isOwner}
        onClose={() => setShowPixModal(false)}
        onUpgrade={() => {
          // O Premium é ativado exclusivamente pelo backend/webhook do PagBank.
          // Após a confirmação, recarrega o perfil e consulta o status real.
          window.location.reload();
        }}
        userId={userId}
      />
    </AppShell>
  );
}

