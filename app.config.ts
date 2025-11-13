import 'dotenv/config';

export default {
  expo: {
    name: 'mchef',
    slug: 'mchef',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'mchef',
    platforms: ['android', 'ios', 'web'],
    extra: {
      EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
      EXPO_PUBLIC_ASSET_BASE: process.env.EXPO_PUBLIC_ASSET_BASE,
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_DEBUG: process.env.EXPO_PUBLIC_DEBUG,
      EXPO_PUBLIC_INTERNAL_API_KEY: process.env.EXPO_PUBLIC_INTERNAL_API_KEY,
    },
  },
};
