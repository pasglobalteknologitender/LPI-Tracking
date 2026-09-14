import type { AdminUser } from './users-data';
import {
  createUserRequest,
  deleteUserRequest,
  fetchUsers,
  updateUserRequest,
} from './api';

export async function getUsers(): Promise<AdminUser[]> {
  return fetchUsers();
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: AdminUser['role'];
}): Promise<AdminUser> {
  return createUserRequest(input);
}

export async function updateUser(
  id: string,
  input: {
    name: string;
    email: string;
    role: AdminUser['role'];
  },
): Promise<AdminUser> {
  return updateUserRequest(id, input);
}

export async function deleteUser(id: string): Promise<void> {
  await deleteUserRequest(id);
}
