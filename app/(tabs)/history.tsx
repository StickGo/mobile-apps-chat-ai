import { Theme } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { deleteConversation, getAllConversations, type Conversation } from '@/services/storage';
import { useFocusEffect, useRouter } from 'expo-router';
import {
    BrainCircuit,
    Clock,
    Cpu,
    Filter,
    MessageSquare,
    Search,
    Trash2,
    Zap
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

export default function HistoryScreen() {
    const router = useRouter();
    const { mode } = useAppTheme();
    const theme = Theme[mode];
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const loadHistories = useCallback(async () => {
        const data = await getAllConversations();
        setConversations(data);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadHistories();
        }, [loadHistories])
    );

    const handleDelete = (id: string) => {
        const performDelete = async () => {
            await deleteConversation(id);
            loadHistories();
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Purge this operational log?")) {
                performDelete();
            }
        } else {
            Alert.alert(
                "Terminate Record?",
                "This action will permanently purge the selected neural data from local storage.",
                [
                    { text: "Abort", style: "cancel" },
                    { text: "Purge", style: "destructive", onPress: performDelete }
                ]
            );
        }
    };

    const filteredConversations = conversations.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item, index }: { item: Conversation, index: number }) => (
        <Animated.View 
            entering={FadeInDown.delay(index * 50).duration(500)}
            exiting={FadeOut.duration(300)}
        >
            <TouchableOpacity 
                style={[styles.chatCard, { backgroundColor: theme.secondaryBackground }]}
                onPress={() => router.push({
                    pathname: '/chat/[id]',
                    params: { id: item.id, name: item.name, category: item.category || 'universal' }
                })}
            >
                <View style={[styles.iconBox, { backgroundColor: theme.text + '10' }]}>
                    {item.category === 'code' ? <Cpu size={20} color={theme.text} /> : 
                     item.category === 'scientific' ? <BrainCircuit size={20} color={theme.text} /> :
                     <MessageSquare size={20} color={theme.text} />}
                </View>
                
                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={[styles.chatName, { color: theme.text }]} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text style={[styles.chatTime, { color: theme.secondaryText }]}>
                            {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </Text>
                    </View>
                    <Text style={[styles.lastMsg, { color: theme.secondaryText }]} numberOfLines={2}>
                        {item.lastMessage || "No messages yet"}
                    </Text>
                </View>

                <TouchableOpacity 
                    style={styles.deleteBtn} 
                    onPress={() => handleDelete(item.id)}
                >
                    <Trash2 size={18} color={theme.secondaryText} opacity={0.6} />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
            
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: theme.text }]}>Neural Archive</Text>
                    <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Stored operational logs</Text>
                </View>
                <View style={[styles.statsBox, { backgroundColor: theme.secondaryBackground }]}>
                    <Zap size={14} color={theme.text} fill={theme.text} />
                    <Text style={[styles.statsText, { color: theme.text }]}>{conversations.length}</Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.secondaryBackground }]}>
                    <Search size={18} color={theme.secondaryText} />
                    <TextInput 
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search archives..."
                        placeholderTextColor={theme.secondaryText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <Filter size={18} color={theme.secondaryText} />
                </View>
            </View>

            <FlatList
                data={filteredConversations}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Clock size={48} color={theme.secondaryText} opacity={0.2} />
                        <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                            {searchQuery ? "No matches found in records" : "No archives synchronized"}
                        </Text>
                    </View>
                }
            />
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
        paddingHorizontal: 24,
        paddingTop: 20,
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.7,
    },
    statsBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statsText: {
        fontSize: 14,
        fontWeight: '800',
    },
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    chatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chatInfo: {
        flex: 1,
        marginLeft: 16,
        marginRight: 8,
    },
    chatHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatName: {
        fontSize: 16,
        fontWeight: '800',
        flex: 1,
    },
    chatTime: {
        fontSize: 11,
        fontWeight: '700',
        opacity: 0.6,
    },
    lastMsg: {
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },
    deleteBtn: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
        gap: 16,
    },
    emptyText: {
        fontSize: 15,
        fontWeight: '700',
        opacity: 0.5,
    },
});
