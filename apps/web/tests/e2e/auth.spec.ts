import { expect, test } from '@playwright/test';
import { DEMO_USERS, loginAs, logout, type DemoRole } from './helpers/auth';
import { expectNoPageErrors, watchPageErrors } from './helpers/quality';

test.describe('authentication', () => {
  for (const route of [
    '/',
    '/shipments',
    '/logs',
    '/users',
    '/shipments/upload',
  ]) {
    test(`redirects anonymous visitor from ${route} to login`, async ({ page }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login$/);
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    });
  }

  for (const role of Object.keys(DEMO_USERS) as DemoRole[]) {
    test(`logs in with the seeded ${role} account`, async ({ page }) => {
      const errors = watchPageErrors(page);
      await loginAs(page, role);
      await expect(page.getByText(DEMO_USERS[role].name)).toBeVisible();
      expectNoPageErrors(errors);
    });
  }

  test('logout invalidates access to protected pages', async ({ page }) => {
    await loginAs(page, 'admin');
    await logout(page);

    await page.goto('/shipments');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('shows validation and invalid credential errors', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Please fill in all fields')).toBeVisible();

    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  for (const role of Object.keys(DEMO_USERS) as DemoRole[]) {
    const user = DEMO_USERS[role];
    test(`${role} demo button fills both login fields`, async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('button', { name: new RegExp(role, 'i') }).click();
      await expect(page.getByLabel('Email')).toHaveValue(user.email);
      await expect(page.getByLabel('Password')).toHaveValue(user.password);
    });
  }
});
