import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

export const DEMO_USERS = {
  admin: {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
  },
  operator: {
    name: 'Operator User',
    email: 'operator@example.com',
    password: 'operator123',
  },
  viewer: {
    name: 'Viewer User',
    email: 'viewer@example.com',
    password: 'viewer123',
  },
} as const;

export type DemoRole = keyof typeof DEMO_USERS;

export async function loginAs(page: Page, role: DemoRole) {
  const user = DEMO_USERS[role];

  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  const loginResponsePromise = page.waitForResponse(
    (response) =>
      response.url().endsWith('/api/v1/auth/login') &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Sign in' }).click();
  const loginResponse = await loginResponsePromise;
  expect(
    loginResponse.ok(),
    `Login failed with ${loginResponse.status()}: ${await loginResponse.text()}`,
  ).toBe(true);

  await expect(page).toHaveURL(/\/shipments$/);
  await expect(page.getByRole('heading', { name: 'Shipments' })).toBeVisible();
}

export async function seedAuth(page: Page, role: DemoRole) {
  await loginAs(page, role);
}

export async function logout(page: Page) {
  await page.getByText(/Admin User|Operator User|Viewer User/).click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);
}
