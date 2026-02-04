import { Theme } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Copy,
  Cpu,
  Image as ImageIcon,
  Lock,
  MoreVertical,
  Plus,
  X,
  Zap
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Clipboard,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { sendMessageToAIStream } from '@/services/api';
import { getConversation, getSystemPrompt, saveConversation } from '@/services/storage';
import * as ImagePicker from 'expo-image-picker';

export default function ChatDetailScreen() {
  const { id, name, category } = useLocalSearchParams();
  const router = useRouter();
  const { mode } = useAppTheme();
  const theme = Theme[mode];
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const loadChat = async () => {
      if (id) {
        const conversation = await getConversation(id as string);
        if (conversation && conversation.messages.length > 0) {
          setMessages(conversation.messages);
        } else {
          setMessages([
            { id: '1', text: `Systems Link Established. I am ${name}. Operation Mode: ${category || 'Universal'}. Ready for input.`, sender: 'ai', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ]);
        }
      }
    };
    loadChat();
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets) {
      setSelectedImage(result.assets[0]);
    }
  };

  const sendMessage = async (text = inputText) => {
    if (text.trim() === '' && !selectedImage) return;
    
    const userMsg = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: selectedImage?.uri,
    };
    
    const updatedMessagesWithUser = [...messages, userMsg];
    setMessages(updatedMessagesWithUser);
    setInputText('');
    const currentImage = selectedImage;
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const history = updatedMessagesWithUser.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model' as 'user' | 'model',
        content: msg.text
      }));

      const customPrompt = await getSystemPrompt();
      const aiMsgId = (Date.now() + 1).toString();
      
      let currentAiText = "";
      let hasCreatedMsg = false;

      const stream = sendMessageToAIStream(
        text, 
        history, 
        customPrompt || undefined,
        currentImage?.base64 || undefined,
        currentImage?.mimeType || 'image/jpeg',
        category as string || 'default'
      );

      for await (const chunk of stream) {
        if (chunk.type === 'text') {
          currentAiText += chunk.data;
          
          if (!hasCreatedMsg && currentAiText.trim()) {
            hasCreatedMsg = true;
            setIsTyping(false);
            const initialAiMsg = {
              id: aiMsgId,
              text: currentAiText,
              sender: 'ai',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessages(prev => [...prev, initialAiMsg]);
          } else if (hasCreatedMsg) {
            setMessages(prev => prev.map(msg => 
              msg.id === aiMsgId ? { ...msg, text: currentAiText } : msg
            ));
          }
        } else if (chunk.type === 'json') {
          const data = chunk.data as any;
          if (data.success) {
            currentAiText = data.message || currentAiText;
            if (!hasCreatedMsg) {
                hasCreatedMsg = true;
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: aiMsgId,
                    text: currentAiText,
                    sender: 'ai',
                    image: data.image,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }]);
            } else {
                setMessages(prev => prev.map(msg => 
                  msg.id === aiMsgId ? { 
                    ...msg, 
                    text: currentAiText, 
                    image: data.image 
                  } : msg
                ));
            }
          }
        }
      }

      const finalMessages = [...updatedMessagesWithUser, {
        id: aiMsgId,
        text: currentAiText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }];
      
      await saveConversation({
        id: id as string || Date.now().toString(),
        name: messages.length === 0 ? (text.slice(0, 20) + '...') : (name as string || 'New Chat'),
        lastMessage: currentAiText,
        timestamp: new Date().toISOString(),
        messages: finalMessages,
        category: category as string,
      });

    } catch (error: any) {
      console.error('Chat Error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    Clipboard.setString(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isUser = item.sender === 'user';
    
    return (
      <Animated.View 
        entering={FadeInDown.duration(400)}
        style={[styles.bubbleContainer, isUser ? styles.userContainer : styles.aiContainer]}
      >
        {!isUser && (
           <View style={[styles.avatarBox, { backgroundColor: theme.text + '10' }]}>
               <Cpu size={16} color={theme.text} />
           </View>
        )}
        <View style={[
          styles.bubble, 
          { 
              backgroundColor: isUser ? theme.text : theme.secondaryBackground,
              borderColor: 'rgba(255,255,255,0.05)',
              borderWidth: 1,
          },
          isUser ? styles.userBubble : styles.aiBubble,
        ]}>
          <Text style={[
            styles.msgText, 
            { color: isUser ? theme.background : theme.text },
          ]}>
            {item.text}
          </Text>

          {item.image && (
            <View style={styles.imageContainer}>
                <ImageIcon size={20} color={isUser ? theme.background : theme.text} />
            </View>
          )}

          <View style={styles.bubbleFooter}>
            <Text style={[styles.timeLabel, { color: isUser ? 'rgba(255,255,255,0.4)' : theme.secondaryText }]}>
              {item.timestamp}
            </Text>
            
            {!isUser && item.text.length > 0 && (
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => copyToClipboard(item.id, item.text)} style={styles.actionBtn}>
                  {copiedId === item.id ? <Check size={12} color={theme.text} /> : <Copy size={12} color={theme.secondaryText} />}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const CATEGORY_SUGGESTIONS: Record<string, string[]> = {
    code: [
        "Explain this function",
        "Refactor for performance",
        "Generate a unit test",
        "Write documentation"
    ],
    scientific: [
        "Summarize this theory",
        "Explain to a 5-year old",
        "Contrast with Newton's laws",
        "What are the implications?"
    ],
    universal: [
        "What's for dinner?",
        "Creative writing prompt",
        "Plan a weekend trip",
        "Summarize current trends"
    ],
    default: [
        "Help me understand this",
        "Give me some ideas",
        "Write a summary",
        "What are the next steps?"
    ]
  };

  const currentSuggestions = CATEGORY_SUGGESTIONS[category as string] || CATEGORY_SUGGESTIONS.default;

  const TypingIndicator = () => {
    const dot1 = useSharedValue(0);
    const dot2 = useSharedValue(0);
    const dot3 = useSharedValue(0);

    useEffect(() => {
      const animate = (val: any, delay: number) => {
        val.value = withRepeat(
          withDelay(delay, withTiming(-6, { duration: 500 })),
          -1,
          true
        );
      };
      animate(dot1, 0);
      animate(dot2, 150);
      animate(dot3, 300);
    }, []);

    const dotStyle1 = useAnimatedStyle(() => ({ transform: [{ translateY: dot1.value }] }));
    const dotStyle2 = useAnimatedStyle(() => ({ transform: [{ translateY: dot2.value }] }));
    const dotStyle3 = useAnimatedStyle(() => ({ transform: [{ translateY: dot3.value }] }));

    return (
      <Animated.View entering={FadeInDown} style={[styles.bubbleContainer, styles.aiContainer]}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, { backgroundColor: theme.text + '40' }, dotStyle1]} />
          <Animated.View style={[styles.dot, { backgroundColor: theme.text + '40' }, dotStyle2]} />
          <Animated.View style={[styles.dot, { backgroundColor: theme.text + '40' }, dotStyle3]} />
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.header, { borderBottomColor: theme.secondaryBackground }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: theme.text }]}>Vanguard Terminal</Text>
            <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: isTyping ? '#F59E0B' : '#10B981' }]} />
                <Text style={[styles.statusLabel, { color: theme.secondaryText }]}>
                    {isTyping ? 'Neural Link Syncing...' : 'Sync Active'}
                </Text>
            </View>
        </View>

        <TouchableOpacity style={styles.headerAction}>
          <MoreVertical size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef as any}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
          {/* Suggestions Layer */}
          {!inputText.trim() && !selectedImage && !isTyping && (
            <Animated.View entering={FadeInDown} style={styles.suggestionLayer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={currentSuggestions}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={[styles.suggestionChip, { backgroundColor: theme.secondaryBackground, borderColor: theme.text + '10' }]}
                            onPress={() => sendMessage(item)}
                        >
                            <Zap size={14} color={theme.text} style={{ opacity: 0.6 }} />
                            <Text style={[styles.suggestionText, { color: theme.secondaryText }]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.suggestionList}
                />
            </Animated.View>
          )}

          {selectedImage && (
            <Animated.View entering={FadeInUp} style={styles.previewBox}>
               <View style={[styles.imagePreview, { backgroundColor: theme.secondaryBackground }]}>
                   <ImageIcon size={20} color={theme.text} />
                   <Text style={[styles.previewText, { color: theme.text }]}>Image Attached</Text>
               </View>
               <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeBtn}>
                   <X size={14} color="#FFF" />
               </TouchableOpacity>
            </Animated.View>
          )}

          <View style={[styles.inputBox, { backgroundColor: theme.secondaryBackground, borderColor: theme.text + '20' }]}>
            <TouchableOpacity style={styles.plusBtn} onPress={pickImage} activeOpacity={0.7}>
                <Plus size={22} color={theme.text} strokeWidth={2.5} />
            </TouchableOpacity>
            
            <TextInput
              style={[styles.input, { color: theme.text, maxHeight: 120 }]}
              placeholder="Inject command to Vanguard..."
              placeholderTextColor={theme.secondaryText + '80'}
              value={inputText}
              onChangeText={setInputText}
              multiline
              selectionColor={theme.text}
            />
            
            <TouchableOpacity 
              onPress={() => sendMessage()}
              disabled={!inputText.trim() && !selectedImage}
              activeOpacity={0.8}
              style={[
                styles.sendBtn, 
                { backgroundColor: theme.text },
                (!inputText.trim() && !selectedImage) && { opacity: 0.1 }
              ]} 
            >
              <ArrowRight size={22} color={theme.background} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
          <View style={styles.securityFlag}>
             <View style={[styles.securityShield, { backgroundColor: theme.text + '10' }]}>
                <Lock size={10} color={theme.text} />
             </View>
             <Text style={[styles.securityText, { color: theme.secondaryText }]}>Encrypted Neural Operation</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 64,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerAction: {
    padding: 8,
  },
  list: {
    padding: 20,
    paddingBottom: 30,
  },
  bubbleContainer: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  avatarBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bubble: {
    padding: 16,
    maxWidth: '85%',
    borderRadius: 22,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    opacity: 0.6,
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  previewText: {
    fontSize: 12,
    fontWeight: '700',
  },
  removeBtn: {
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    marginTop: -20,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  plusBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any),
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  suggestionLayer: {
    marginBottom: 16,
  },
  suggestionList: {
    paddingLeft: 4,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  securityFlag: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 16,
      opacity: 0.6,
  },
  securityShield: {
      width: 18,
      height: 18,
      borderRadius: 6,
      justifyContent: 'center',
      alignItems: 'center',
  },
  securityText: {
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  }
});
