// Luvina
// Vu Huy Hoang - Dev2
import type { UserRole } from "@prisma/client";

export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface SanitizedUserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseDto {
  user: SanitizedUserDto;
  accessToken: string;
}

export interface CurrentUserResponseDto {
  user: SanitizedUserDto;
}

export interface EditorAccessResponseDto {
  message: string;
}

export interface JwtPayloadDto {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export type AuthenticatedUser = SanitizedUserDto;