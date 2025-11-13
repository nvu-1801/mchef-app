// app/_layout.tsx
import React from 'react';
import { Slot } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/store/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
}
