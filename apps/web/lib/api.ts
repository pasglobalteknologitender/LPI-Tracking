import {
  mapAuthUserFromDto,
  mapIntegrationLogFromDto,
  mapMeFromDto,
  mapMilestoneFromDto,
  mapShipmentDetailFromDto,
  mapShipmentListItemFromDto,
  mapUserFromDto,
  type AuthUserDto,
  type IntegrationLog,
  type MeResponseDataDto,
  type MilestoneDto,
  type ShipmentDetailDto,
  type ShipmentListItemDto,
  type TransvoyantLogDto,
  type UserDto,
} from '@lpi/contracts';
import { apiFetch, ApiClientError, apiFetchPaginated } from './api-client';
import type { Milestone, Shipment } from './types';
import type { AdminUser } from './users-data';

export async function loginRequest(email: string, password: string) {
  const response = await apiFetch<{
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
    user: AuthUserDto;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  return mapAuthUserFromDto(response.data.user);
}

export async function meRequest() {
  const response = await apiFetch<MeResponseDataDto>('/auth/me');
  return mapMeFromDto(response.data);
}

export async function logoutRequest() {
  await apiFetch<null>('/auth/logout', { method: 'POST', body: JSON.stringify({}) });
}

export async function fetchShipments(limit = 100): Promise<Shipment[]> {
  const response = await apiFetchPaginated<ShipmentListItemDto>(
    `/shipments?limit=${limit}`,
  );
  return response.data.map((item) => ({
    ...mapShipmentListItemFromDto(item),
    milestones: [],
  }));
}

export async function fetchShipmentById(id: string): Promise<Shipment | null> {
  try {
    const response = await apiFetch<ShipmentDetailDto>(`/shipments/${id}`);
    const shipment = mapShipmentDetailFromDto(response.data);
    return {
      ...shipment,
      milestones: shipment.milestones ?? [],
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function patchMilestoneRequest(
  shipmentId: string,
  milestoneId: string,
  milestone: Milestone,
): Promise<Milestone> {
  const response = await apiFetch<MilestoneDto>(
    `/shipments/${shipmentId}/milestones/${milestoneId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status: milestone.status,
        date_time: milestone.dateTime,
        location: milestone.location,
        notes: milestone.notes,
        photo: milestone.photo,
      }),
    },
  );

  return mapMilestoneFromDto(response.data);
}

function toAdminUser(dto: UserDto): AdminUser {
  const user = mapUserFromDto(dto);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    lastLogin: user.lastLogin,
  };
}

export async function fetchUsers(limit = 100): Promise<AdminUser[]> {
  const response = await apiFetchPaginated<UserDto>(`/users?limit=${limit}`);
  return response.data.map(toAdminUser);
}

export async function createUserRequest(input: {
  name: string;
  email: string;
  password: string;
  role: AdminUser['role'];
}): Promise<AdminUser> {
  const response = await apiFetch<UserDto>('/users', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      status: 'active',
    }),
  });
  return toAdminUser(response.data);
}

export async function updateUserRequest(
  id: string,
  input: {
    name: string;
    email: string;
    role: AdminUser['role'];
  },
): Promise<AdminUser> {
  const response = await apiFetch<UserDto>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      role: input.role,
    }),
  });
  return toAdminUser(response.data);
}

export async function deleteUserRequest(id: string): Promise<void> {
  await apiFetch<null>(`/users/${id}`, { method: 'DELETE' });
}

export async function fetchLogs(limit = 100): Promise<IntegrationLog[]> {
  const response = await apiFetchPaginated<TransvoyantLogDto>(`/logs?limit=${limit}`);
  return response.data.map(mapIntegrationLogFromDto);
}
