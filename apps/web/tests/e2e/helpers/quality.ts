import { expect, type Page } from '@playwright/test';

export function watchPageErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

export function expectNoPageErrors(errors: string[]) {
  expect(errors, `Unexpected browser page errors:\n${errors.join('\n')}`).toEqual(
    [],
  );
}
