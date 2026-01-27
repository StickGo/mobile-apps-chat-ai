import { Theme } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Activity, Briefcase, Cpu, Gamepad2, HeartPulse, Plus, Search, Trophy } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
    Platform,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

const CATEGORIES = [
  { id: 'sports', name: 'Sports', icon: Trophy },
  { id: 'health', name: 'Health', icon: HeartPulse },
  { id: 'games', name: 'Games', icon: Gamepad2 },
  { id: 'work', name: 'Work', icon: Briefcase },
];

const DUMMY_CHATS = [
  { id: 'sports_bot', name: 'Coach AI', preview: 'Ready for today’s training?', time: '12:05 PM', avatar: 'https://cdn-icons-png.flaticon.com/512/3663/3663335.png', unread: 2, model: 'vanguard-xl', tokens: '1.2k' },
  { id: 'health_bot', name: 'Health Mate', preview: 'Remember to drink water!', time: '09:42 AM', avatar: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png', unread: 0, model: 'synapse-lite', tokens: '450' },
  { id: 'games_bot', name: 'Game Guide', preview: 'New patches are live.', time: 'Yesterday', avatar: 'https://cdn-icons-png.flaticon.com/512/686/686589.png', unread: 0, model: 'neural-x', tokens: '2.8k' },
];

export default function ConversationListScreen() {
  const router = useRouter();
  const { mode } = useAppTheme();
  const theme = Theme[mode];
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const renderChatItem = ({ item, index }: { item: typeof DUMMY_CHATS[0], index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)}>
      <TouchableOpacity
        style={[styles.chatItem, { borderBottomColor: theme.secondaryBackground }]}
        onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id, name: item.name, category: item.id.split('_')[0] } })}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
            <View style={[styles.modelBadge, { backgroundColor: theme.secondaryBackground }]}>
               <Text style={[styles.modelText, { color: theme.secondaryText }]}>{item.model}</Text>
            </View>
          </View>
          <View style={styles.chatFooter}>
            <Text style={[styles.preview, { color: theme.secondaryText }]} numberOfLines={1}>
              {item.preview}
            </Text>
            <Text style={[styles.tokenText, { color: theme.secondaryText }]}>{item.tokens} tokens</Text>
          </View>
        </View>
        <View style={styles.rightSide}>
           <Text style={[styles.time, { color: theme.secondaryText }]}>{item.time}</Text>
           {item.unread > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.text }]}>
                <Text style={[styles.badgeText, { color: theme.background }]}>{item.unread}</Text>
              </View>
            )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Intelligence</Text>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.secondaryBackground }]}>
          <Activity size={18} color={theme.text} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={DUMMY_CHATS}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            <View style={[styles.heroCard, { backgroundColor: theme.text }]}>
                <View style={styles.heroHeader}>
                    <Text style={[styles.heroPre, { color: theme.background }]}>CORE_STATUS: RUNNING</Text>
                    <Cpu size={16} color={theme.background} />
                </View>
                <Text style={[styles.heroTitle, { color: theme.background }]}>Vanguard Pro</Text>
                <View style={styles.statsRow}>
                   <View style={styles.stat}>
                      <Text style={[styles.statVal, { color: theme.background }]}>12ms</Text>
                      <Text style={[styles.statLab, { color: theme.background, opacity: 0.6 }]}>LATENCY</Text>
                   </View>
                   <View style={styles.stat}>
                      <Text style={[styles.statVal, { color: theme.background }]}>99.9%</Text>
                      <Text style={[styles.statLab, { color: theme.background, opacity: 0.6 }]}>UPTIME</Text>
                   </View>
                   <View style={styles.stat}>
                      <Text style={[styles.statVal, { color: theme.background }]}>4.2GB</Text>
                      <Text style={[styles.statLab, { color: theme.background, opacity: 0.6 }]}>MEMORY</Text>
                   </View>
                </View>
            </View>

            <View style={styles.searchRow}>
                <View style={[styles.searchBox, { backgroundColor: theme.secondaryBackground }]}>
                <Search size={18} color={theme.secondaryText} />
                <TextInput 
                    placeholder="Search neural directory" 
                    placeholderTextColor={theme.secondaryText}
                    style={[styles.searchInput, { color: theme.text }]}
                />
                </View>
            </View>

            <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => (
                <TouchableOpacity 
                    key={cat.id} 
                    style={[styles.catItem, { backgroundColor: theme.secondaryBackground }]}
                    onPress={() => router.push({ pathname: '/chat/[id]', params: { id: cat.id, name: `${cat.name} AI`, category: cat.id } })}
                >
                    <cat.icon size={20} color={theme.text} />
                    <Text style={[styles.catLabel, { color: theme.text }]}>{cat.name}</Text>
                </TouchableOpacity>
                ))}
            </View>
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
        }
      />

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.text }]}>
         <Plus size={24} color={theme.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 30,
    padding: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroPre: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    flex: 1,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '900',
  },
  statLab: {
    fontSize: 8,
    fontWeight: '800',
    marginTop: 2,
  },
  searchRow: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBox: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    textAlignVertical: 'center',
    padding: 0,
  },
  categoryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  catItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  catLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  listContainer: {
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
  },
  modelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  modelText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preview: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.7,
  },
  tokenText: {
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 8,
  },
  rightSide: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  time: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  badge: {
    height: 18,
    minWidth: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 110 : 90,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
});
