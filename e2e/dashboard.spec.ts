import { expect, test } from '@playwright/test';

test('protects the dashboard and shows the login screen', async ({ page }) => {
  await page.route('**/api/v1/auth/me', (route) => route.fulfill({
    status: 401,
    contentType: 'application/problem+json',
    json: { title: 'UNAUTHORIZED', status: 401, detail: 'Sesión inválida o vencida.' },
  }));
  await page.goto('/');

  await expect(page.getByAltText('Estudio Guzmán')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ingresar a la plataforma' })).toBeVisible();
});
