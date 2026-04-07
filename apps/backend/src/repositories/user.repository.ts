// Luvina
// Vu Huy Hoang - Dev2
import type { Prisma, User } from "@prisma/client";
import prisma from "../config/prisma";

export async function findByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function findById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: Prisma.UserCreateInput): Promise<User> {
  return prisma.user.create({ data });
}