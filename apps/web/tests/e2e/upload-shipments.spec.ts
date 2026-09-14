import { expect, test } from '@playwright/test';
import path from 'path';
import { seedAuth } from './helpers/auth';
import { expectNoPageErrors, watchPageErrors } from './helpers/quality';

test.beforeEach(async ({ page }) => {
  await seedAuth(page, 'admin');
  await page.goto('/shipments/upload');
  await expect(page.getByRole('heading', { name: 'Upload Shipments' })).toBeVisible();
});

test('shows the no-file state before a preview is selected', async ({ page }) => {
  await expect(page.getByText('No file selected')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Import$/ })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Preview Table' })).toHaveCount(0);
});

test('previews, imports, and resets a valid shipment file', async ({ page }) => {
  const errors = watchPageErrors(page);
  await page.setInputFiles(
    '#shipment-file-upload',
    path.join(__dirname, 'fixtures', 'shipments-valid.csv'),
  );

  await expect(page.getByText('shipments-valid.csv')).toBeVisible();
  await expect(page.getByText('All required columns valid')).toBeVisible();
  await expect(page.getByText('Preview Rows', { exact: true }).locator('..')).toContainText('5');
  await expect(page.getByText('Required Columns', { exact: true }).locator('..')).toContainText('7');
  await expect(page.getByText('Import Status', { exact: true }).locator('..')).toContainText('Ready');
  await expect(page.getByText('LPI-260710-001')).toBeVisible();

  await page.getByRole('button', { name: /^Import$/ }).click();
  await expect(page.getByText('5 mock shipments imported')).toBeVisible();
  await expect(page.getByText('Import Status', { exact: true }).locator('..')).toContainText('Imported');

  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByText('No file selected')).toBeVisible();
  await expect(page.getByText('shipments-valid.csv')).toHaveCount(0);
  await expect(page.getByText('5 mock shipments imported')).toHaveCount(0);
  expectNoPageErrors(errors);
});

test('uses mock preview rows regardless of selected CSV content', async ({ page }) => {
  await page.setInputFiles(
    '#shipment-file-upload',
    path.join(__dirname, 'fixtures', 'shipments-empty.csv'),
  );

  await expect(page.getByText('shipments-empty.csv')).toBeVisible();
  await expect(page.getByText('LPI-260710-001')).toBeVisible();
  await expect(page.getByText('Preview Rows', { exact: true }).locator('..')).toContainText('5');
  await expect(page.getByText('All required columns valid')).toBeVisible();
});
