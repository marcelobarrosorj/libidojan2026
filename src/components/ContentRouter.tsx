import React from "react";
import { Feed } from "./Feed";
import { Radar } from "./Radar";
import { Chat } from "./Chat";
import { Profile } from "./Profile";
import { Top } from "./Top";
import { AdminPanel } from "./AdminPanel";
import { Forum } from "./Forum";
import { Events } from "./Events";
import { Groups } from "./Groups";
import { Invites } from "./Invites";
import { SettingsPage } from "./SettingsPage";
import { ViewProfile } from "./ViewProfile";
import { User } from "../types";

export const routes: Record<string, React.FC<any>> = {
  feed: Feed,
  radar: Radar,
  chat: Chat,
  profile: Profile,
  top: Top,
  admin: AdminPanel,
  forum: Forum,
  events: Events,
  groups: Groups,
  invites: Invites,
  settings: SettingsPage,
  viewprofile: ViewProfile,
};

interface ContentRouterProps {
  activeTab: string;
  navParams?: any;
  navigate?: (tab: string, params?: any) => void;
  isPremium?: boolean;
  isAdmin?: boolean;
  onShowPremiumModal?: () => void;
  userId?: string;
  onLogout?: () => void;
  currentUser?: User | null;
}

export function ContentRouter({ activeTab, navParams, navigate, isPremium, isAdmin, onShowPremiumModal, userId, onLogout, currentUser }: ContentRouterProps) {
  const Component = routes[activeTab];

  if (!Component) {
    return <div className="text-[var(--libido-text)] p-4">Not found: {activeTab}</div>;
  }

  return (
    <main className={`flex-1 flex flex-col w-full overflow-x-hidden relative z-0 bg-[var(--libido-bg)] min-h-0 ${activeTab === 'chat' ? 'overflow-y-hidden' : 'overflow-y-auto no-scrollbar'}`}>
      <Component 
        isPremium={isPremium} 
        isAdmin={isAdmin}
        onShowPremiumModal={onShowPremiumModal}
        userId={userId}
        onLogout={onLogout}
        navParams={navParams}
        navigate={navigate}
        currentUser={currentUser}
        user={navParams?.user}
      />
    </main>
  );
}
