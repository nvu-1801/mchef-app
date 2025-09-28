// app/_layout.tsx
import React from "react";
import { Slot } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ActivityIndicator, View } from "react-native";

import { store, persistor } from "../src/store/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        loading={
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator />
          </View>
        }
      >
        {/* TẤT CẢ screen/stack con sẽ nằm trong Provider */}
        <Slot />
      </PersistGate>
    </Provider>
  );
}
