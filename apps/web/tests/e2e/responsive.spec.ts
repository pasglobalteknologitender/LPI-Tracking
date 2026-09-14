import { expect, test } from '@playwright/test';
import { loginAs, seedAuth } from './helpers/auth';
import { expectNoPageErrors, watchPageErrors } from './helpers/quality';

const viewports = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

for (const viewport of viewports) {
  test(`login and shipments render without overflow on ${viewport.name}`, async ({ page }) => {
    const errors = watchPageErrors(page);
    await page.setViewportSize(viewport);
    await page.goto('/login');

    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    await loginAs(page, 'admin');
    await expect(page.getByRole('heading', { name: 'Shipments' })).toBeVisible();
    await expect(
      page.getByPlaceholder('Search by Reference, BOL, or Container...'),
    ).toBeVisible();
    const shipmentReference = page.getByText('QA-D2D-FCL-SYNCED');
    await expect(shipmentReference.nth(viewport.width < 768 ? 1 : 0)).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expectNoPageErrors(errors);
  });
}

test('mobile sidebar remains usable for allowed navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedAuth(page, 'admin');
  await page.goto('/shipments');

  await page.getByRole('button', { name: 'Toggle Sidebar' }).click();
  await page.getByRole('link', { name: /Logs/ }).click();
  await expect(page).toHaveURL(/\/logs$/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'TransVoyant Logs' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
