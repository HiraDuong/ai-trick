// Luvina
// Vu Huy Hoang - Dev2
export interface CategoryNodeDto {
  id: string;
  name: string;
  description: string | null;
  children: CategoryNodeDto[];
}

export interface CategoryTreeResponseDto {
  categories: CategoryNodeDto[];
  total: number;
}