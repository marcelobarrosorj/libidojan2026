
import { User } from '../types';

const DAILY_VIEW_LIMIT = 2;

export const usageService = {
  getUsage: () => {
    const data = localStorage.getItem('libido_usage');
    const today = new Date().toISOString().split('T')[0];
    
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.date === today) {
        return parsed.views;
      }
    }
    return 0;
  },

  incrementView: () => {
    const today = new Date().toISOString().split('T')[0];
    const currentViews = usageService.getUsage();
    const newViews = currentViews + 1;
    
    localStorage.setItem('libido_usage', JSON.stringify({
      date: today,
      views: newViews
    }));
    
    return newViews;
  },

  canViewProfile: (user: User | null) => {
    if (!user) return false;
    if (user.isSubscriber) return true;
    
    return usageService.getUsage() < DAILY_VIEW_LIMIT;
  },

  getRemainingViews: () => {
    return Math.max(0, DAILY_VIEW_LIMIT - usageService.getUsage());
  }
};
