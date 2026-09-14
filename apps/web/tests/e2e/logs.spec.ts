import { expect, test } from '@playwright/test';
import { seedAuth } from './helpers/auth';
import { expectNoPageErrors, watchPageErrors } from './helpers/quality';

test.beforeEach(async ({ page }) => {
  await seedAuth(page, 'admin');
  await page.goto('/logs');
  await expect(page.getByRole('heading', { name: 'TransVoyant Logs' })).toBeVisible();
  await expect(page.getByText('QA-D2D-FCL-SYNCED').first()).toBeVisible();
});

test('filters logs and restores the unfiltered view', async ({ page }) => {
  const toolbar = page.locator('.lpi-toolbar');
  await page.getByPlaceholder('Search shipment...').fill('QA-D2D-FCL-SYNCED');
  await page.getByText('All Status').click();
  await page.getByRole('option', { name: 'Success' }).click();
  await page.getByText('All Type').click();
  await page.getByRole('option', { name: 'Pre-transportation' }).click();

  const matchingRow = page.getByRole('row').filter({ hasText: 'QA-D2D-FCL-SYNCED' }).first();
  await expect(matchingRow).toContainText('Success');
  await expect(matchingRow).toContainText('Pre-Transportation');

  await toolbar.getByRole('button').last().click();
  await expect(page.getByPlaceholder('Search shipment...')).toHaveValue('');
  await expect(toolbar.getByText('All Status')).toBeVisible();
  await expect(toolbar.getByText('All Type')).toBeVisible();
  await expect(page.getByText('QA-D2P-LCL-UNSYNCED').first()).toBeVisible();
});

test('shows an empty state for an unmatched log search', async ({ page }) => {
  await page.getByPlaceholder('Search shipment...').fill('NO-SUCH-LOG');
  await expect(page.getByRole('heading', { name: 'No logs found' })).toBeVisible();
});

test('opens log detail dialog', async ({ page }) => {
  const errors = watchPageErrors(page);
  await page
    .getByRole('row')
    .filter({ hasText: 'QA-D2D-FCL-SYNCED' })
    .first()
    .getByRole('button')
    .last()
    .click();
  await expect(page.getByRole('heading', { name: 'Log Detail' })).toBeVisible();
  await expect(page.getByText('Request Payload')).toBeVisible();
  await expect(page.getByText('Response')).toBeVisible();
  expectNoPageErrors(errors);
});

test('shows complete pre-transportation shipment attribute payload', async ({ page }) => {
  await page
    .getByRole('row')
    .filter({ hasText: 'QA-D2D-FCL-SYNCED' })
    .filter({ hasText: 'Pre-Transportation' })
    .first()
    .getByRole('button')
    .last()
    .click();

  await expect(page.getByRole('heading', { name: 'Log Detail' })).toBeVisible();
  await expect(page.getByText('"customerReferenceNumber": "QA-D2D-FCL-SYNCED"')).toBeVisible();
  await expect(page.getByText('"bol": "MAEU123456789"')).toBeVisible();
  await expect(page.getByText('"hbol": "MAEU-HBL-123456"')).toBeVisible();
  await expect(page.getByText('"movementType": "D2D"')).toBeVisible();
  await expect(page.getByText('"containerType": "42GP"')).toBeVisible();
  await expect(page.getByText('"carrierEta":')).toBeVisible();
});

test('allows viewer log access but rejects anonymous API access', async ({ page, request }) => {
  await page.context().clearCookies();
  await seedAuth(page, 'viewer');
  const viewerResponse = await page.request.get('/api/v1/logs');
  expect(viewerResponse.status()).toBe(200);

  const anonymousResponse = await request.get('/api/v1/logs');
  expect(anonymousResponse.status()).toBe(401);
});
