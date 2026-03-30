import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Link, Tabs } from 'expo-router';
import { Platform, Pressable } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#f97316', // Saffron Theme Color
        tabBarInactiveTintColor: '#6b7280',
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          elevation: 5,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Civic Feed',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'list.bullet', android: 'list', web: 'list' }}
              tintColor={color}
              size={24}
            />
          ),
          headerStyle: { backgroundColor: '#f97316' },
          headerTintColor: '#fff',
          headerRight: () => (
            <Link href="/login" asChild>
              <Pressable style={{ marginRight: 15 }}>
                {({ pressed }) => (
                  <SymbolView
                    name={{ ios: 'person.crop.circle', android: 'person', web: 'person' }}
                    size={28}
                    tintColor="#fff"
                    style={{ opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />      <Tabs.Screen
        name="report"
        options={{
          title: 'Report Issue',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'camera.fill', android: 'camera', web: 'camera' }}
              tintColor={color}
              size={24}
            />
          ),
          headerStyle: { backgroundColor: '#f97316' },
          headerTintColor: '#fff',
        }}
      />
    </Tabs>
  );
}
