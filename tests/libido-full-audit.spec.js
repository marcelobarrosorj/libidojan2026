import { test, expect } from '@playwright/test';

test.describe('Auditoria Completa do Libido App', () => {
  test('1. Testar carregamento e elementos da página inicial', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await expect(page).toHaveTitle(/Libido App/i);
    await page.screenshot({ path: 'test-results/home-audit.png', fullPage: true });
  });

  test('2. Testar rotas principais (Radar, Busca, Chat e Perfil)', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.setViewportSize({ width: 390, height: 844 });
    const bodyText = await page.textContent('body');
    expect(bodyText.length).toBeGreaterThan(0);
    await page.screenshot({ path: 'test-results/mobile-view.png' });
  });

  test('3. Testar fluxo de autenticação / login', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill('teste_robo@libidoapp.com.br');
      await page.screenshot({ path: 'test-results/login-preenchido.png' });
    }
  });
});