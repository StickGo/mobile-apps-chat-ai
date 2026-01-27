import { Theme } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { Tabs } from 'expo-router';
import { MessageSquare, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const { mode } = useAppTheme();
  const theme = Theme[mode];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.secondaryText,
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { 
            backgroundColor: theme.background,
            borderTopColor: theme.secondaryBackground,
          }
        ],
        tabBarLabelStyle: styles.label,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <MessageSquare size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrapper}>
              <User size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 65,
    borderTopWidth: 1,
    elevation: 0,
    backgroundColor: '#FFFFFF',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 30,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: Platform.OS === 'ios' ? 0 : 8,
  },
});
