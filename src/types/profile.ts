// src/types/profile.ts
export type ChefProfile = {
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
  ratings: {
    id: string;
    raterId: string;
    stars: number;
    comment: string | null;
    createdAt: string;
  }[];
};
