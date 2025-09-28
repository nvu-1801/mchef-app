// app/(auth)/_layout.tsx
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator } from 'react-native';

import { store, persistor } from '../src/store/store';
import { bootstrapAuthListener } from '../src/auth/bootstrapAuth';

export default function AuthLayout() {
  useEffect(() => {
    const off = bootstrapAuthListener();
    return () => off?.();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
        <Stack screenOptions={{ headerTitleAlign: 'center' }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="sign-in" options={{ title: 'Sign In' }} />
          <Stack.Screen name="sign-up" options={{ title: 'Sign Up' }} />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
