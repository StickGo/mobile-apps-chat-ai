import { Theme } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import {
    Bell,
    ChevronRight,
    Info,
    LogOut,
    Moon,
    Shield,
    Trash2,
    User
} from 'lucide-react-native';
import React from 'react';
import {
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const MENU_ITEMS = [
  { icon: User, label: 'Account' },
  { icon: Bell, label: 'Notifications' },
  { icon: Shield, label: 'Privacy' },
  { icon: Info, label: 'Help & Support' },
];

import { clearAllConversations, getSystemPrompt, saveSystemPrompt } from '@/services/storage';
import { Terminal } from 'lucide-react-native';
import { Alert, TextInput } from 'react-native';

export default function ProfileScreen() {
  const { mode, toggleTheme } = useAppTheme();
  const theme = Theme[mode];
  const [systemPrompt, setSystemPrompt] = React.useState('');

  React.useEffect(() => {
    getSystemPrompt().then(p => setSystemPrompt(p || ''));
  }, []);

  const handlePromptChange = (val: string) => {
    setSystemPrompt(val);
    saveSystemPrompt(val);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Conversations?',
      'This will delete all chat history permanently. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllConversations();
            Alert.alert('Success', 'All conversations have been cleared!');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View style={styles.profileHeader}>
          <Image source={{ uri: 'https://i.pravatar.cc/150?u=me' }} style={styles.avatar} />
          <Text style={[styles.name, { color: theme.text }]}>John Doe</Text>
          <Text style={[styles.email, { color: theme.secondaryText }]}>john.doe@chatai.io</Text>
        </View>

        <View style={styles.menuBox}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>PREFERENCES</Text>
          
          <View style={[styles.menuItem, { borderBottomColor: theme.secondaryBackground }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.secondaryBackground }]}>
                <Moon size={20} color={theme.text} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>Dark Mode</Text>
            </View>
            <Switch 
              value={mode === 'dark'} 
              onValueChange={toggleTheme} 
              trackColor={{ false: '#D1D1D6', true: theme.text }}
              thumbColor={Platform.OS === 'ios' ? undefined : theme.background}
            />
          </View>

          <View style={[styles.promptContainer, { borderBottomColor: theme.secondaryBackground, borderBottomWidth: 1, paddingVertical: 15 }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme.secondaryBackground }]}>
                <Terminal size={20} color={theme.text} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>System Persona</Text>
            </View>
            <TextInput
              style={[styles.promptInput, { color: theme.text, backgroundColor: theme.secondaryBackground }]}
              placeholder="e.g. Speak like a pirate"
              placeholderTextColor={theme.secondaryText}
              multiline
              value={systemPrompt}
              onChangeText={handlePromptChange}
            />
          </View>

          <TouchableOpacity 
            style={[styles.clearButton, { backgroundColor: '#FF3B30', marginHorizontal: 20, marginVertical: 15 }]}
            onPress={handleClearAll}
          >
            <Trash2 size={18} color="#FFFFFF" />
            <Text style={[styles.clearButtonText, { color: '#FFFFFF' }]}>Clear All Conversations</Text>
          </TouchableOpacity>

          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.menuItem, { borderBottomColor: theme.secondaryBackground }]}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.secondaryBackground }]}>
                  <item.icon size={20} color={theme.text} />
                </View>
                <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              </View>
              <ChevronRight size={18} color={theme.secondaryText} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.secondaryBackground }]}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: theme.secondaryText }]}>v1.5.0 Stable Release</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
  },
  email: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  menuBox: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 24,
    height: 54,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 10,
    letterSpacing: 1,
  },
  promptContainer: {
    marginBottom: 10,
  },
  promptInput: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    fontWeight: '500',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
