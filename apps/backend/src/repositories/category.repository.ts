// Luvina
// Vu Huy Hoang - Dev2
import { Prisma } from "@prisma/client";
import prisma from "../config/prisma";

const categorySelect = Prisma.validator<Prisma.CategorySelect>()({
  id: true,
  name: true,
  description: true,
  parentId: true,
});

export type CategoryRecord = Prisma.CategoryGetPayload<{ select: typeof categorySelect }>;

export async function findAllCategories(): Promise<CategoryRecord[]> {
  return prisma.category.findMany({
    select: categorySelect,
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });
}