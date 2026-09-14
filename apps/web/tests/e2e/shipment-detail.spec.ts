import { expect, test } from '@playwright/test';
import { seedAuth } from './helpers/auth';
import { expectNoPageErrors, watchPageErrors } from './helpers/quality';
import { SEED_SHIPMENT_IDS } from './helpers/seed-ids';

test('shows not found for an unknown shipment', async ({ page }) => {
  await seedAuth(page, 'admin');
  await page.goto('/shipments/ffffffff-ffff-4fff-8fff-ffffffffffff');
  await expect(page.getByRole('heading', { name: 'Shipment not found' })).toBeVisible();
});

test('renders shipment facts and timeline from the API', async ({ page }) => {
  const errors = watchPageErrors(page);
  await seedAuth(page, 'admin');
  await page.goto(`/shipments/${SEED_SHIPMENT_IDS.synced}`);

  await expect(page.getByRole('heading', { name: 'QA-D2D-FCL-SYNCED' })).toBeVisible();
  await expect(page.getByText('MAEU123456789')).toBeVisible();
  await expect(page.getByText('MSKU1234567')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Shipment Timeline' })).toBeVisible();
  await expect(page.getByText('Booking Confirmation')).toBeVisible();
  expectNoPageErrors(errors);
});

test('authorized user previews a dummy photo and persists milestone text', async ({ page }) => {
  await seedAuth(page, 'admin');
  await page.goto(`/shipments/${SEED_SHIPMENT_IDS.synced}`);

  await page.getByText('Booking Confirmation').click();
  await page.getByRole('button', { name: 'Edit Milestone' }).click();
  await page.getByPlaceholder('Enter milestone location').fill('Jakarta Warehouse');
  await page.getByPlaceholder('Add notes...').fill('Updated by Playwright comprehensive E2E');

  await page.getByRole('button', { name: 'Use Dummy Photo' }).click();
  await expect(page.getByRole('img', { name: 'Preview' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();

  await page.getByRole('button', { name: 'Edit Milestone' }).click();
  await page.getByPlaceholder('Enter milestone location').fill('Jakarta Warehouse');
  await page.getByPlaceholder('Add notes...').fill('Updated by Playwright comprehensive E2E');
  const updateResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/milestones/') &&
      response.request().method() === 'PATCH',
  );
  await page.getByRole('button', { name: 'Save' }).click();
  const updateResponse = await updateResponsePromise;
  expect(
    updateResponse.status(),
    `Milestone update failed: ${await updateResponse.text()}`,
  ).toBe(200);

  await expect(page.getByText('Jakarta Warehouse')).toBeVisible();
  await expect(page.getByText('Updated by Playwright comprehensive E2E')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'QA-D2D-FCL-SYNCED' })).toBeVisible();
  await page.getByText('Booking Confirmation').click();
  await expect(page.getByText('Jakarta Warehouse')).toBeVisible();
  await expect(page.getByText('Updated by Playwright comprehensive E2E')).toBeVisible();
});

test('viewer can open detail but cannot edit or sync', async ({ page }) => {
  await seedAuth(page, 'viewer');
  await page.goto(`/shipments/${SEED_SHIPMENT_IDS.synced}`);

  await page.getByText('Booking Confirmation').click();
  await expect(page.getByRole('button', { name: 'Edit Milestone' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Retry Sync' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Mark Synced' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Mark Unsynced' })).toHaveCount(0);
});
