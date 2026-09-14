import type { AuthUserDto, MeResponseDataDto } from '../api/auth';
import type { UserDto, UserDetailDto } from '../api/user';
import type { User } from '../domain/user';

export function mapUserFromDto(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    status: dto.status,
    lastLogin: dto.last_login,
  };
}

export function mapUserDetailFromDto(dto: UserDetailDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    status: dto.status,
    lastLogin: dto.last_login,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapAuthUserFromDto(dto: AuthUserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    status: 'active',
  };
}

export function mapMeFromDto(dto: MeResponseDataDto): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    role: dto.role,
    status: 'active',
    lastLogin: dto.last_login,
  };
}

export function mapUserToDto(user: User): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    last_login: user.lastLogin,
  };
}
