// Luvina
// Vu Huy Hoang - Dev2
import { findAllCategories, type CategoryRecord } from "../repositories/category.repository";
import type { CategoryNodeDto, CategoryTreeResponseDto } from "../types/category.types";

function createCategoryNode(category: CategoryRecord): CategoryNodeDto {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    children: [],
  };
}

function buildCategoryTree(categories: CategoryRecord[]): CategoryNodeDto[] {
  const categoryMap = new Map<string, CategoryNodeDto>();
  const rootCategories: CategoryNodeDto[] = [];

  categories.forEach((category) => {
    categoryMap.set(category.id, createCategoryNode(category));
  });

  categories.forEach((category) => {
    const categoryNode = categoryMap.get(category.id);
    if (!categoryNode) {
      return;
    }

    if (!category.parentId) {
      rootCategories.push(categoryNode);
      return;
    }

    const parentNode = categoryMap.get(category.parentId);
    if (!parentNode) {
      rootCategories.push(categoryNode);
      return;
    }

    parentNode.children.push(categoryNode);
  });

  return rootCategories;
}

export async function getCategoryTree(): Promise<CategoryTreeResponseDto> {
  const categories = await findAllCategories();
  return { categories: buildCategoryTree(categories), total: categories.length };
}