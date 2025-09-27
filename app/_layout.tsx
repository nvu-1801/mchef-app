import React from 'react';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../src/storage/store';
import { ActivityIndicator } from 'react-native';

export default function AuthLayout() {
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
