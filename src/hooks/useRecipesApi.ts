// hooks/useRecipesApi.ts
import { useCallback } from 'react';
import type { DishInput as RecipePayload, Dish as Recipe } from '@/src/types/dish';

type Options = {
  baseUrl?: string;
  getToken?: () => string | undefined;
};

export function useRecipesApi(opts: Options = {}) {
  const baseUrl = opts.baseUrl ?? '';
  const getToken = opts.getToken ?? (() => undefined);

  const headers = () => {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const listRecipes = useCallback(async (): Promise<Recipe[]> => {
    const res = await fetch(`${baseUrl}/api/recipes`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to list recipes');
    return res.json();
  }, [baseUrl]);

  const createRecipe = useCallback(async (data: RecipePayload): Promise<Recipe> => {
    const res = await fetch(`${baseUrl}/api/recipes`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create recipe');
    return res.json();
  }, [baseUrl]);

  const updateRecipe = useCallback(async (id: string, data: RecipePayload): Promise<Recipe> => {
    const res = await fetch(`${baseUrl}/api/recipes/${id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update recipe');
    return res.json();
  }, [baseUrl]);

  const deleteRecipe = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`${baseUrl}/api/recipes/${id}`, {
      method: 'DELETE',
      headers: headers(),
    });
    if (!res.ok) throw new Error('Failed to delete recipe');
  }, [baseUrl]);

  return { listRecipes, createRecipe, updateRecipe, deleteRecipe };
}
