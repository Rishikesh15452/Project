import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';

export default function AdminLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#ea580c', // Saffron primary
        tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
        tabBarStyle: {
          backgroundColor: isDark ? '#09090b' : '#ffffff',
          borderTopColor: isDark ? '#27272a' : '#f3f4f6',
          elevation: 0,
        },
        headerStyle: {
          backgroundColor: isDark ? '#09090b' : '#ffffff',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: isDark ? '#f9fafb' : '#111827',
        headerTitleStyle: {
          fontWeight: '700',
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Admin Board',
          tabBarIcon: ({ color }) => (
            <SymbolView name="chart.bar.doc.horizontal.fill" size={26} tintColor={color} fallback={<></>} />
          ),
        }}
      />
    </Tabs>
  );
}
