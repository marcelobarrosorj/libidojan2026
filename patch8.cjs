const fs = require('fs');
const path = 'src/tests/PixCheckout.test.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
`  it('Renders and successfully loads Pix info, updates to PAID, and reloads Premium', async () => {`,
`  it('Requires valid CPF before creating payment', async () => {
    const onUpgradeMock = vi.fn();
    const onCloseMock = vi.fn();
    (supabase.auth.getSession as any).mockResolvedValue({
      data: { session: { access_token: 'fake-access-token' } }
    });

    render(<PixCheckout isOpen={true} onClose={onCloseMock} onUpgrade={onUpgradeMock} userId="user-123" />);

    expect(screen.getByText('Ative o Premium')).toBeTruthy();
    const generateBtn = screen.getByText('Gerar Pix');
    expect((generateBtn as HTMLButtonElement).disabled).toBe(true);

    const input = screen.getByPlaceholderText('000.000.000-00');
    
    // Type invalid CPF
    await userEvent.type(input, '11111111111');
    expect((generateBtn as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('CPF inválido')).toBeTruthy();

    await userEvent.clear(input);

    // Type valid CPF
    await userEvent.type(input, '52998224725');
    // The mask will apply 529.982.247-25
    expect((generateBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('Renders and successfully loads Pix info, updates to PAID, and reloads Premium', async () => {`
);

// In the second test, we now need to enter the CPF and click 'Gerar Pix'
code = code.replace(
`    render(<PixCheckout isOpen={true} onClose={onCloseMock} onUpgrade={onUpgradeMock} userId="user-123" />);

    expect(screen.getByText('Ative o Premium')).toBeTruthy();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/payment/create', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Authorization': 'Bearer fake-access-token' })
      }));
    });`,
`    render(<PixCheckout isOpen={true} onClose={onCloseMock} onUpgrade={onUpgradeMock} userId="user-123" />);

    expect(screen.getByText('Ative o Premium')).toBeTruthy();

    const input = screen.getByPlaceholderText('000.000.000-00');
    await userEvent.type(input, '52998224725');

    const generateBtn = screen.getByText('Gerar Pix');
    await userEvent.click(generateBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/payment/create', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Authorization': 'Bearer fake-access-token' }),
        body: JSON.stringify({ customerTaxId: '52998224725' })
      }));
    });`
);

fs.writeFileSync(path, code);
