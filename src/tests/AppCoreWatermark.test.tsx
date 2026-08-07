import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppCore } from '../components/AppCore';
import { User } from '../types';

describe('AppCore SecurityWatermark', () => {
  it('renders watermark for all user roles using currentUser', () => {
    const roles = ['free', 'premium', 'moderator', 'admin', 'owner'];
    
    for (const role of roles) {
      const user: User = {
        id: '123',
        nickname: `User${role}`,
        userNumber: 100,
        plan: role,
        followers: 0,
        following: 0,
        isOnline: true,
        location: { x: 0, y: 0 }
      };

      const { container, unmount } = render(<AppCore currentUser={user} />);
      
      const watermarkTexts = screen.getAllByText(new RegExp(`User${role} • #000100 • Libido App`, 'i'));
      expect(watermarkTexts.length).toBeGreaterThan(0);
      
      // Pointer events none check
      const watermarkDivs = container.querySelectorAll('.pointer-events-none');
      expect(watermarkDivs.length).toBeGreaterThan(0);
      
      unmount();
    }
  });
});
