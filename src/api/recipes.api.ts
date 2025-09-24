// // src/api/recipes.api.ts
// import { api } from "./base";
// import { Recipe } from "@/src/types/entities";

// export const recipesApi = api.injectEndpoints({
//   endpoints: (b) => ({
//     listRecipes: b.query<{ items: Recipe[]; nextCursor?: string }, { q?: string; cat?: string; cursor?: string }>({
//       query: (params) => ({ url: "/recipes", params }),
//       providesTags: (res) =>
//         res?.items
//           ? [
//               ...res.items.map((r) => ({ type: "Recipe" as const, id: r.id })),
//               { type: "Recipe" as const, id: "LIST" },
//             ]
//           : [{ type: "Recipe", id: "LIST" }],
//     }),
//     getRecipe: b.query<Recipe, { slug: string }>({
//       query: ({ slug }) => `/recipes/${slug}`,
//       providesTags: (res) => (res ? [{ type: "Recipe", id: res.id }] : []),
//     }),
//     toggleBookmark: b.mutation<{ ok: true }, { recipeId: string }>({
//       query: (body) => ({ url: "/bookmarks/toggle", method: "POST", body }),
//       invalidatesTags: (_r, _e, { recipeId }) => [{ type: "Recipe", id: recipeId }],
//     }),
//   }),
// });

// export const { useListRecipesQuery, useGetRecipeQuery, useToggleBookmarkMutation } = recipesApi;
