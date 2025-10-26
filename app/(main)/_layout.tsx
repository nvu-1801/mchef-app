import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MainTabs() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#16a34a',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          marginBottom: 20,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarIcon: ({ color, focused }) => {
          const iconMap: Record<string, { active: string; inactive: string }> =
            {
              home: { active: 'home', inactive: 'home' },
              favorites: { active: 'bookmark', inactive: 'bookmark' },
              myrecipe: { active: 'edit', inactive: 'edit-2' },
              accounts: { active: 'users', inactive: 'users' },
              profile: { active: 'user', inactive: 'user' },
            };

          const routeName = route.name.split('/')[0]; // Handle nested routes
          const icons = iconMap[routeName] || {
            active: 'circle',
            inactive: 'circle',
          };
          const iconName = focused ? icons.active : icons.inactive;

          if (focused) {
            return (
              <View style={styles.activeIconWrapper}>
                <LinearGradient
                  colors={['#dcfce7', '#bbf7d0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeIconBg}
                >
                  <Feather name={iconName as any} size={22} color="#16a34a" />
                </LinearGradient>
              </View>
            );
          }

          return <Feather name={iconName as any} size={24} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Saved' }} />
      <Tabs.Screen name="myrecipe" options={{ title: 'Create' }} />
      <Tabs.Screen name="accounts/index" options={{ title: 'Chefs' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />

      {/* Hidden screens */}
      <Tabs.Screen name="recipe/dishes" options={{ href: null }} />
      <Tabs.Screen name="recipe/[id]" options={{ href: null }} />
      <Tabs.Screen name="chef/[id]" options={{ href: null }} />
      <Tabs.Screen name="chef/index" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBg: {
    width: 56,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
