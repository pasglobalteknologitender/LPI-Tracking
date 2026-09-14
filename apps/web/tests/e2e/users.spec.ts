import { expect, test } from '@playwright/test';
import { seedAuth } from './helpers/auth';
import { expectNoPageErrors, watchPageErrors } from './helpers/quality';
import { deleteUserByEmail, uniqueTestEmail } from './helpers/users';

test.beforeEach(async ({ page }) => {
  await seedAuth(page, 'admin');
  await page.goto('/users');
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
});

test('shows seeded users, filters them, and clears filters', async ({ page }) => {
  const toolbar = page.locator('.lpi-toolbar');
  await expect(page.getByText('Total Users')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'admin@example.com' })).toBeVisible();

  await page.getByPlaceholder('Search name or email...').fill('operator');
  await page.getByText('All Roles').click();
  await page.getByRole('option', { name: 'Operator' }).click();
  await expect(page.getByRole('cell', { name: 'operator@example.com' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'admin@example.com' })).toHaveCount(0);

  await toolbar.getByRole('button').last().click();
  await expect(page.getByPlaceholder('Search name or email...')).toHaveValue('');
  await expect(toolbar.getByText('All Roles')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'admin@example.com' })).toBeVisible();
});

test('shows an empty state when no user matches', async ({ page }) => {
  await page.getByPlaceholder('Search name or email...').fill('no-such-user-zzzz');
  await expect(page.getByRole('heading', { name: 'No users found' })).toBeVisible();
});

test('prevents empty user submission with native required validation', async ({ page }) => {
  let createRequests = 0;
  page.on('request', (request) => {
    if (
      request.url().endsWith('/api/v1/users') &&
      request.method() === 'POST'
    ) {
      createRequests += 1;
    }
  });

  await page.getByRole('button', { name: /Add User/i }).click();
  await page.getByRole('button', { name: 'Add User', exact: true }).click();

  const validationMessage = await page
    .getByLabel('Name')
    .evaluate((element: HTMLInputElement) => element.validationMessage);
  expect(validationMessage.length).toBeGreaterThan(0);
  expect(createRequests).toBe(0);
  await expect(page.getByRole('heading', { name: 'Add New User' })).toBeVisible();
});

test('shows API validation for a short password', async ({ page }) => {
  await page.getByRole('button', { name: /Add User/i }).click();
  await page.getByLabel('Name').fill('Short Password User');
  await page.getByLabel('Email').fill(uniqueTestEmail());
  await page.getByLabel('Password').fill('short');
  await page.getByRole('button', { name: 'Add User', exact: true }).click();

  await expect(page.getByText('Validation error')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add New User' })).toBeVisible();
});

test('creates, edits, reloads, and deletes a unique user', async ({ page }) => {
  const errors = watchPageErrors(page);
  const email = uniqueTestEmail();

  try {
    await page.getByRole('button', { name: /Add User/i }).click();
    const createDialog = page.getByRole('dialog', { name: 'Add New User' });
    await createDialog.getByLabel('Name').fill('Playwright User');
    await createDialog.getByLabel('Email').fill(email);
    await createDialog.getByLabel('Password').fill('password123');
    await createDialog.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Viewer' }).click();
    await createDialog.getByRole('button', { name: 'Add User' }).click();

    await page.getByPlaceholder('Search name or email...').fill(email);
    let row = page.getByRole('row').filter({ hasText: email });
    await expect(row).toContainText('Playwright User');
    await expect(row).toContainText('Viewer');

    await row.getByRole('button').first().click();
    const editDialog = page.getByRole('dialog', { name: 'Edit User' });
    await editDialog.getByLabel('Name').fill('Playwright Edited');
    await editDialog.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Operator' }).click();
    await editDialog.getByRole('button', { name: 'Save Changes' }).click();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    await page.getByPlaceholder('Search name or email...').fill(email);
    row = page.getByRole('row').filter({ hasText: email });
    await expect(row).toContainText('Playwright Edited');
    await expect(row).toContainText('Operator');

    await row.getByRole('button').nth(1).click();
    await expect(page.getByRole('heading', { name: 'Delete User' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete User' }).click();
    await expect(page.getByRole('cell', { name: email })).toHaveCount(0);
    expectNoPageErrors(errors);
  } finally {
    await deleteUserByEmail(page.request, email);
  }
});

test('shows server conflict feedback for a duplicate email', async ({ page }) => {
  await page.getByRole('button', { name: /Add User/i }).click();
  const dialog = page.getByRole('dialog', { name: 'Add New User' });
  await dialog.getByLabel('Name').fill('Duplicate Admin');
  await dialog.getByLabel('Email').fill('admin@example.com');
  await dialog.getByLabel('Password').fill('password123');
  await dialog.getByRole('button', { name: 'Add User' }).click();

  await expect(page.getByText('Email already in use')).toBeVisible();
  await expect(dialog).toBeVisible();
});
