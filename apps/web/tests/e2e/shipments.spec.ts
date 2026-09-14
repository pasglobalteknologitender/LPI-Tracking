import { expect, test } from '@playwright/test';
import { seedAuth } from './helpers/auth';
import { expectNoPageErrors, watchPageErrors } from './helpers/quality';

const searchCases = [
  { label: 'reference', value: 'QA-D2D-FCL-SYNCED' },
  { label: 'BOL', value: 'MAEU123456789' },
  { label: 'container', value: 'MSKU1234567' },
] as const;

test.beforeEach(async ({ page }) => {
  await seedAuth(page, 'admin');
  await page.goto('/shipments');
  await expect(page.getByRole('heading', { name: 'Shipments' })).toBeVisible();
  await expect(page.getByText('QA-D2D-FCL-SYNCED').first()).toBeVisible();
});

test('lists seeded shipments and opens the selected detail', async ({ page }) => {
  const errors = watchPageErrors(page);
  await expect(page.getByText('Total Shipments')).toBeVisible();

  await page.getByRole('link', { name: /QA-D2D-FCL-SYNCED/ }).first().click();
  await expect(page).toHaveURL(/\/shipments\/00000000-0000-4000-8000-000000000010$/);
  await expect(page.getByRole('heading', { name: 'QA-D2D-FCL-SYNCED' })).toBeVisible();
  expectNoPageErrors(errors);
});

for (const searchCase of searchCases) {
  test(`searches shipments by ${searchCase.label}`, async ({ page }) => {
    await page
      .getByPlaceholder('Search by Reference, BOL, or Container...')
      .fill(searchCase.value);
    await expect(page.getByText('QA-D2D-FCL-SYNCED').first()).toBeVisible();
    await expect(page.getByText('QA-D2P-LCL-UNSYNCED')).toHaveCount(0);
  });
}

test('filters shipments by cargo, movement, and status then clears filters', async ({ page }) => {
  await page.getByText('All Cargo').click();
  await page.getByRole('option', { name: 'FCL' }).click();
  await page.getByText('All Types').click();
  await page.getByRole('option', { name: 'Door to Door' }).click();
  await page.getByText('All Status').click();
  await page.getByRole('option', { name: 'Pending' }).click();

  await expect(page.getByText('QA-D2D-FCL-SYNCED').first()).toBeVisible();
  await expect(page.getByText('QA-D2P-LCL-UNSYNCED')).toHaveCount(0);

  const toolbar = page.locator('.lpi-toolbar');
  await toolbar.getByRole('button').last().click();
  await expect(toolbar.getByText('All Cargo')).toBeVisible();
  await expect(toolbar.getByText('All Types')).toBeVisible();
  await expect(toolbar.getByText('All Status')).toBeVisible();
  await expect(page.getByText('QA-D2P-LCL-UNSYNCED').first()).toBeVisible();
});

test('shows empty state when no shipment matches', async ({ page }) => {
  await page
    .getByPlaceholder('Search by Reference, BOL, or Container...')
    .fill('NO-SUCH-SHIPMENT');
  await expect(page.getByText(/No shipments found/i)).toBeVisible();
});

test('moves forward and backward through shipment pages', async ({ page }) => {
  await expect(page.getByText(/Page 1 of 2/)).toBeVisible();
  await page.getByRole('link', { name: /Next/i }).click();
  await expect(page.getByText(/Page 2 of 2/)).toBeVisible();
  await expect(page.getByText('QA-D2D-FCL-SYNCED')).toHaveCount(0);

  await page.getByRole('link', { name: /Previous/i }).click();
  await expect(page.getByText(/Page 1 of 2/)).toBeVisible();
  await expect(page.getByText('QA-D2D-FCL-SYNCED').first()).toBeVisible();
});
