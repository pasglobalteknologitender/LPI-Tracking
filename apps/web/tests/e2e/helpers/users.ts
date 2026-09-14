import type { APIRequestContext } from '@playwright/test';

type UserListResponse = {
  data?: Array<{ id: string; email: string }>;
};

export function uniqueTestEmail() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `playwright-${suffix}@example.com`;
}

export async function deleteUserByEmail(
  request: APIRequestContext,
  email: string,
) {
  const response = await request.get(
    `/api/v1/users?search=${encodeURIComponent(email)}&limit=100`,
  );

  if (!response.ok()) {
    throw new Error(
      `Unable to query test user during cleanup: ${response.status()}`,
    );
  }

  const payload = (await response.json()) as UserListResponse;
  const matches = (payload.data ?? []).filter((user) => user.email === email);

  for (const user of matches) {
    const deleteResponse = await request.delete(`/api/v1/users/${user.id}`, {
      headers: { Origin: 'http://localhost:3100' },
    });
    if (![200, 404].includes(deleteResponse.status())) {
      throw new Error(
        `Unable to delete test user during cleanup: ${deleteResponse.status()}`,
      );
    }
  }
}
