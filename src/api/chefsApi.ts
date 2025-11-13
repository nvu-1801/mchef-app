// src/api/chefsApi.ts
import { baseApi } from './baseApi';

export type ChefRating = {
  id: string;
  raterId: string;
  stars: number;
  comment: string | null;
  createdAt: string;
};

export type Chef = {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  isActive: boolean;
  canPost: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  averageRating: number | null;
  totalRatings: number;
  ratings: ChefRating[];
};

export const chefsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    getChef: b.query<Chef, string>({
      query: (id) => {
        console.log('[ChefsApi] getChef query:', id);
        return { url: `/chefs/${id}` };
      },
      transformResponse: (resp: unknown) => {
        console.log('[ChefsApi] getChef response:', resp);
        if (!resp || typeof resp !== 'object') {
          throw new Error('Invalid response');
        }
        return resp as Chef;
      },
      providesTags: (_r, _e, id) => [{ type: 'Profile', id }],
    }),
  }),
});

export const { useGetChefQuery } = chefsApi;
