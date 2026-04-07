// Luvina
// Vu Huy Hoang - Dev2
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { UserRole, type User } from "@prisma/client";
import config from "../config/env";
import * as userRepository from "../repositories/user.repository";
import type {
  AuthResponseDto,
  CurrentUserResponseDto,
  EditorAccessResponseDto,
  JwtPayloadDto,
  LoginRequestDto,
  RegisterRequestDto,
  SanitizedUserDto,
} from "../types/auth.types";
import { createHttpError } from "../utils/error.utils";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readPayloadObject(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw createHttpError(400, "Request body must be a JSON object");
  }

  return payload as Record<string, unknown>;
}

function readTrimmedString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw createHttpError(400, `${fieldName} must be a string`);
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    throw createHttpError(400, `${fieldName} is required`);
  }

  return trimmedValue;
}

function sanitizeUser(user: User): SanitizedUserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function signAccessToken(user: User): string {
  const expiresIn = config.jwtExpiresIn as NonNullable<SignOptions["expiresIn"]>;

  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn }
  );
}

function validateRegisterPayload(payload: unknown): RegisterRequestDto {
  const body = readPayloadObject(payload);
  const name = readTrimmedString(body.name, "Name");
  const email = readTrimmedString(body.email, "Email").toLowerCase();
  const password = readTrimmedString(body.password, "Password");

  if (name.length < 2 || name.length > 80) {
    throw createHttpError(400, "Name must be between 2 and 80 characters long");
  }
  if (!emailPattern.test(email)) {
    throw createHttpError(400, "Email format is invalid");
  }
  if (password.length < 8 || password.length > 72) {
    throw createHttpError(400, "Password must be between 8 and 72 characters long");
  }

  return { name, email, password };
}

function validateLoginPayload(payload: unknown): LoginRequestDto {
  const body = readPayloadObject(payload);
  const email = readTrimmedString(body.email, "Email").toLowerCase();
  const password = readTrimmedString(body.password, "Password");

  if (!emailPattern.test(email)) {
    throw createHttpError(400, "Email format is invalid");
  }

  return { email, password };
}

export async function registerUser(payload: RegisterRequestDto | unknown): Promise<AuthResponseDto> {
  const { name, email, password } = validateRegisterPayload(payload);
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw createHttpError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.createUser({
    name,
    email,
    passwordHash,
    role: UserRole.AUTHOR,
  });

  return { user: sanitizeUser(user), accessToken: signAccessToken(user) };
}

export async function loginUser(payload: LoginRequestDto | unknown): Promise<AuthResponseDto> {
  const { email, password } = validateLoginPayload(payload);
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw createHttpError(401, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw createHttpError(401, "Invalid email or password");
  }

  return { user: sanitizeUser(user), accessToken: signAccessToken(user) };
}

export async function getUserById(userId: string): Promise<SanitizedUserDto> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw createHttpError(401, "Authenticated user no longer exists");
  }

  return sanitizeUser(user);
}

export function getCurrentUserResponse(userId: string): Promise<CurrentUserResponseDto> {
  return getUserById(userId).then((user) => ({ user }));
}

export function getEditorAccessResponse(): EditorAccessResponseDto {
  return { message: "Editor access granted" };
}

export function verifyAccessToken(token: string): JwtPayloadDto {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (typeof decoded !== "object" || !decoded.sub || !decoded.email || !decoded.role) {
      throw createHttpError(401, "Invalid or expired access token");
    }

    const payload: JwtPayloadDto = {
      sub: String(decoded.sub),
      email: String(decoded.email),
      role: decoded.role as UserRole,
    };

    if (typeof decoded.iat === "number") {
      payload.iat = decoded.iat;
    }
    if (typeof decoded.exp === "number") {
      payload.exp = decoded.exp;
    }

    return payload;
  } catch {
    throw createHttpError(401, "Invalid or expired access token");
  }
}