import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme, TouchableOpacity, Text, Image, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const isDark = useColorScheme() === 'dark';
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ec4899',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: isDark ? '#000' : '#fff',
          borderTopColor: isDark ? '#1a1a1a' : '#f3f4f6',
          borderTopWidth: 1,
          elevation: 0,
        },
        headerStyle: {
          backgroundColor: isDark ? '#000' : '#fff',
          shadowColor: 'transparent',
          elevation: 0,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? '#1a1a1a' : '#f3f4f6',
        },
        headerTintColor: isDark ? '#fff' : '#111',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Issues',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📋</Text>,
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Image source={require('../../assets/images/icon.png')} style={{ width: 28, height: 28, borderRadius: 8 }} />
              <Text style={{ fontSize: 18, fontWeight: '900', color: isDark ? '#fff' : '#111' }}>Loksetu</Text>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={async () => { await supabase.auth.signOut(); router.replace('/login'); }}
              style={{ marginRight: 16, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(239,68,68,0.1)' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#ef4444' }}>Sign Out</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📷</Text>,
          headerTitle: 'Report Issue',
          headerTitleStyle: { fontWeight: '900' },
        }}
      />
    </Tabs>
  );
}
