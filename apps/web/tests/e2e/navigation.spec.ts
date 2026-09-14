import { expect, test } from '@playwright/test';
import { seedAuth } from './helpers/auth';
import { expectNoPageErrors, watchPageErrors } from './helpers/quality';

test('admin can navigate every primary route from the sidebar', async ({ page }) => {
  const errors = watchPageErrors(page);
  await seedAuth(page, 'admin');

  await page.goto('/');
  await expect(page).toHaveURL(/\/shipments$/);
  await expect(page.getByRole('heading', { name: 'Shipments' })).toBeVisible();

  await page.getByRole('link', { name: /Logs/ }).click();
  await expect(page).toHaveURL(/\/logs$/);
  await expect(page.getByRole('heading', { name: 'TransVoyant Logs' })).toBeVisible();

  await page.getByRole('link', { name: /Users/ }).click();
  await expect(page).toHaveURL(/\/users$/);
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();

  await page.getByRole('link', { name: /Shipments/ }).click();
  await expect(page).toHaveURL(/\/shipments$/);
  expectNoPageErrors(errors);
});
