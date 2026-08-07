import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SecurityWatermark } from '../components/SecurityWatermark';

describe('SecurityWatermark', () => {
  it('renders watermark with username and userNumber', () => {
    const { container } = render(<SecurityWatermark currentUser={{ nickname: 'Casal', userNumber: 1 } as any} local={true} />);
    expect(screen.getAllByText(/Casal • #000001/i).length).toBeGreaterThan(0);
  });

  it('renders correctly without userNumber', () => {
    const { container } = render(<SecurityWatermark currentUser={{ nickname: 'Beijo' } as any} local={true} />);
    expect(screen.getAllByText(/Beijo/i).length).toBeGreaterThan(0);
  });
});
