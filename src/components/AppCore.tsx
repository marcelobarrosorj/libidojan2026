import { updateUserProfile } from '../services/users';
import { initNavHistory, registrarTela } from '../services/navHistory'; // NAV-HISTORY
import { useEffect, useState, useRef, ReactNode } from "react";
import { AppShell } from "./AppShell";
import { BottomNavGlobal } from "./BottomNavGlobal";
import { ContentRouter } from "./ContentRouter";
import { PixCheckout } from "./PixCheckout";
import { User } from '../types';
import { SecurityWatermark } from './SecurityWatermark';
import { checkUserPremium } from '../services/premium';
import { iniciarGpsGlobal } from '../services/gpsGlobal'; // GPS-GLOBAL-MOD
import { startPresence, stopPresence } from '../services/presence'; // PRESENCA-MOD
import { iniciarNotificacoesGlobais } from '../services/notificacoesGlobais'; // NOTIF-GLOBAL-MOD
import { iniciarInstalarApp } from '../instalarApp'; // PWA-INSTALL-MOD
iniciarInstalarApp(); // PWA-INSTALL-MOD

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

  const premiumUntilStr = (currentUser as any)?.premium_until || ''; // PREM-EXPIRA
  const premiumUntilMs = premiumUntilStr ? new Date(premiumUntilStr).getTime() : 0; // PREM-EXPIRA
  const premiumValido = !premiumUntilMs || premiumUntilMs > Date.now(); // PREM-EXPIRA: sem data = eterno
  // FIX-ACESSO: premium booleano e a fonte de verdade; plano owner libera; data nula = eterno.
  const temFlagPremium =
    (currentUser as any)?.premium === true ||
    String((currentUser as any)?.premium) === 'true';
  const isPremium =
    isOwner ||
    temFlagPremium ||
    !!hasActiveSubscription ||
    (userPlan === 'premium' && premiumValido) ||
    userPlan === 'owner' ||
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
    // Proteção extra: caso seja Owner, fecha imediatamente qualquer checkout aberto.
    if (isOwner) {
      setShowPixModal(false);
    }
  }, [isOwner]);
  // GPS-GLOBAL-MOD: posicao salva continuamente com o app aberto (qualquer tela)
  useEffect(() => {
    if (!userId) return;
    return iniciarGpsGlobal(userId);
  }, [userId]);
  // PRESENCA-MOD: heartbeat de presenca (is_online verdadeiro com app aberto)
  useEffect(() => {
    if (!userId) return;
    void startPresence(userId);
    return () => { void stopPresence(); };
  }, [userId]);
  // NOTIF-GLOBAL-MOD: escuta global de notificacoes (modulo externo)
  const [unreadChat, setUnreadChat] = useState(0);
  const activeTabRef = useRef(activeTab);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => {
    if (!userId) return;
    return iniciarNotificacoesGlobais(userId, () => activeTabRef.current, setUnreadChat);
  }, [userId]);

  const openPremiumCheckout = () => {
    // Owner, admin e usuários Premium não podem abrir cobrança.
    if (isOwner || isPremium || !premiumChecked) {
      return;
    }

    setShowPixModal(true);
  };

  const navigate = (tab: string, params?: any) => {
    registrarTela(tab, params); // NAV-HISTORY: registra a tela no historico
    initNavHistory(navigate); // NAV-HISTORY: ativa o botao voltar interno
    setActiveTab(tab);
    setNavParams(params || null);
  };

  return (
    <AppShell>
      <SecurityWatermark currentUser={currentUser} local={false} />

      {showNav && (
        <div className="flex-none bg-[var(--libido-bg)] border-b border-[var(--libido-border)] relative z-50">
          <BottomNavGlobal
            activeTab={activeTab}
            onTabChange={(tab) => navigate(tab)}
            isAdmin={isAdmin}
            unreadChat={unreadChat}
            isPremium={isPremium}
            onPremiumClick={openPremiumCheckout}
          />
        </div>
      )}

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
