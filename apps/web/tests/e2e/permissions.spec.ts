import { expect, test } from '@playwright/test';
import { seedAuth } from './helpers/auth';
import { SEED_SHIPMENT_IDS } from './helpers/seed-ids';

test.describe('role permissions', () => {
  test('admin can access every primary feature', async ({ page }) => {
    await seedAuth(page, 'admin');
    await page.goto('/shipments');

    await expect(page.getByRole('link', { name: /Shipments/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Logs/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Users/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Upload Shipment' })).toBeVisible();
  });

  test('operator can upload, update, sync, and view logs but cannot manage users', async ({ page }) => {
    await seedAuth(page, 'operator');
    await page.goto('/shipments');

    await expect(page.getByRole('link', { name: /Logs/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Upload Shipment' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Users/ })).toHaveCount(0);

    await page.goto(`/shipments/${SEED_SHIPMENT_IDS.synced}`);
    await page.getByText('Booking Confirmation').click();
    await expect(page.getByRole('button', { name: 'Edit Milestone' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Retry Sync' }).first()).toBeVisible();

    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible();
  });

  test('viewer can view shipments and logs but cannot mutate shipments or manage users', async ({ page }) => {
    await seedAuth(page, 'viewer');
    await page.goto('/shipments');

    await expect(page.getByRole('link', { name: /Logs/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Upload Shipment' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Users/ })).toHaveCount(0);

    await page.goto('/logs');
    await expect(page.getByRole('heading', { name: 'TransVoyant Logs' })).toBeVisible();

    await page.goto('/shipments/upload');
    await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible();
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Access denied' })).toBeVisible();

    const response = await page.request.patch(
      `/api/v1/shipments/${SEED_SHIPMENT_IDS.synced}/milestones/00000000-0000-4000-8000-000000000020`,
      {
        headers: { Origin: 'http://localhost:3100' },
        data: {
          status: 'done',
          date_time: '2026-07-10T14:30:00.000Z',
          location: 'Forbidden update',
          notes: 'Viewer must not persist this',
          photo: null,
        },
      },
    );
    expect(response.status()).toBe(403);
  });
});
