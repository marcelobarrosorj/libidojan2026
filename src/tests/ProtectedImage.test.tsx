import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProtectedImage } from '../components/ProtectedImage';

describe('ProtectedImage', () => {
  it('prevents drag and context menu and has security css', () => {
    const { container } = render(<ProtectedImage src="test.jpg" alt="test" currentUser={{ nickname: 'Casal', userNumber: 1 } as any} />);
    const img = screen.getByRole('img');
    
    // draggable={false}
    expect(img.getAttribute('draggable')).toBe('false');
    
    // dragstart blocked
    const dragResult = fireEvent.dragStart(img);
    expect(dragResult).toBe(false); 
    
    // context menu blocked on image
    const contextResult = fireEvent.contextMenu(img);
    expect(contextResult).toBe(false);

    // css checks
    expect(img.style.userSelect).toBe('none');
    expect((img.style as any).WebkitUserSelect).toBe('none');
    expect((img.style as any).WebkitUserDrag).toBe('none');
    expect((img.style as any).WebkitTouchCallout).toBe('none');
    
    // Watermark local and pointer-events check
    const watermarkDivs = container.querySelectorAll('.pointer-events-none');
    expect(watermarkDivs.length).toBeGreaterThan(0);
  });
});
