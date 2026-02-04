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
  MoreVertical,
  Paperclip,
  Plus,
  Share2,
  Trash2,
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
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown, SlideInRight } from 'react-native-reanimated';

const UNIVERSAL_SUGGESTIONS = [
  "Analyze this situation",
  "Write a neural script",
  "Optimize my sleep",
  "Gaming strategies",
  "Career roadmap",
  "Explain complex physics"
];

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
  const [thinkingPhase, setThinkingPhase] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Load existing messages on mount
  useEffect(() => {
    const loadChat = async () => {
      if (id) {
        const conversation = await getConversation(id as string);
        if (conversation && conversation.messages.length > 0) {
          setMessages(conversation.messages);
        } else {
          setMessages([
            { id: '1', text: `Systems synchronized. I am ${name}. Current Protocol: ${category || 'General'}. How may I assist your operations?`, sender: 'ai', timestamp: '10:30 AM' }
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

    const phases = ['Analysing...', 'Verifying Data...', 'Synthesizing...'];
    let phaseIdx = 0;
    const phaseInterval = setInterval(() => {
      setThinkingPhase(phases[phaseIdx]);
      phaseIdx++;
      if (phaseIdx >= phases.length) clearInterval(phaseInterval);
    }, 500);

    try {
      const history = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model' as 'user' | 'model',
        content: msg.text
      }));

      const customPrompt = await getSystemPrompt();
      const aiMsgId = (Date.now() + 1).toString();
      
      let currentAiText = "";
      const initialAiMsg = {
        id: aiMsgId,
        text: "",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setMessages(prev => [...prev, initialAiMsg]);

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
          setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId ? { ...msg, text: currentAiText } : msg
          ));
        } else if (chunk.type === 'json') {
          const data = chunk.data as any;
          if (data.success) {
            setMessages(prev => prev.map(msg => 
              msg.id === aiMsgId ? { 
                ...msg, 
                text: data.message || msg.text || currentAiText, 
                image: data.image 
              } : msg
            ));
          } else {
            setMessages(prev => prev.map(msg => 
              msg.id === aiMsgId ? { 
                ...msg, 
                text: `⚠️ Connectivity Error\n${data.error || 'Server unreachable'}` 
              } : msg
            ));
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
        name: name as string || 'New Chat',
        lastMessage: currentAiText,
        timestamp: new Date().toISOString(),
        messages: finalMessages,
        category: category as string,
      });

    } catch (error: any) {
      console.error('Chat Error:', error);
    } finally {
      setIsTyping(false);
      setThinkingPhase('');
      clearInterval(phaseInterval);
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    Clipboard.setString(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareMessage = async (text: string) => {
    try {
      await Share.share({ message: text });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteMessage = async (msgId: string) => {
    const updatedMessages = messages.filter(m => m.id !== msgId);
    setMessages(updatedMessages);
    
    await saveConversation({
      id: id as string || Date.now().toString(),
      name: name as string || 'New Chat',
      lastMessage: updatedMessages[updatedMessages.length - 1]?.text || '',
      timestamp: new Date().toISOString(),
      messages: updatedMessages,
      category: category as string,
    });
  };

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isUser = item.sender === 'user';
    const isCode = item.text.startsWith('```');
    
    if (!item.text.trim() && !item.image) return null;
    
    return (
      <Animated.View 
        entering={isUser ? SlideInRight.duration(400) : FadeInDown.duration(400)}
        style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}
      >
        <View style={[
          styles.bubble, 
          { backgroundColor: isUser ? theme.text : (isCode ? theme.secondaryBackground : theme.aiBubble) },
          isUser ? styles.userBubble : styles.aiBubble,
          isCode && styles.codeBubble
        ]}>
          <Text style={[
            styles.msgText, 
            { color: isUser ? theme.background : theme.text },
            isCode && styles.codeText
          ]}>
            {item.text.replace(/```/g, '')}
          </Text>

          {item.image && (
            <View style={styles.imageContainer}>
                <View style={[styles.imageBubble, { overflow: 'hidden', borderRadius: 12 }]}>
                   <ImageIcon size={20} color={theme.text} />
                </View>
            </View>
          )}

          <View style={styles.bubbleFooter}>
            <Text style={[styles.timeLabel, { color: isUser ? 'rgba(255,255,255,0.4)' : theme.secondaryText }]}>
              {item.timestamp}
            </Text>
            
            {!isUser && (
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => copyToClipboard(item.id, item.text)} style={styles.actionBtn}>
                  {copiedId === item.id ? <Check size={14} color={theme.text} /> : <Copy size={14} color={theme.secondaryText} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => shareMessage(item.text)} style={styles.actionBtn}>
                  <Share2 size={14} color={theme.secondaryText} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteMessage(item.id)} style={styles.actionBtn}>
                  <Trash2 size={14} color={theme.secondaryText} />
                </TouchableOpacity>
              </View>
            )}
          </View>
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
          <View style={styles.nameRow}>
            <Text style={[styles.headerName, { color: theme.text }]}>Vanguard Core</Text>
            <Zap size={14} color={theme.text} fill={theme.text} style={{ marginLeft: 6 }} />
          </View>
          {isTyping ? (
            <Text style={[styles.headerStatus, { color: theme.text, fontWeight: '700' }]}>{thinkingPhase || 'Thinking...'}</Text>
          ) : (
            <Text style={[styles.headerStatus, { color: theme.secondaryText }]}>Vanguard Core v4.2</Text>
          )}
        </View>
        <TouchableOpacity style={styles.backBtn}>
          <MoreVertical size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef as any}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isTyping ? (
            <Animated.View entering={FadeInDown.duration(400)} style={styles.typingContainer}>
              <View style={[styles.typingBubble, { backgroundColor: theme.secondaryBackground }]}>
                <View style={[styles.typingDot, { backgroundColor: theme.text }]} />
                <View style={[styles.typingDot, { backgroundColor: theme.text, opacity: 0.6 }]} />
                <View style={[styles.typingDot, { backgroundColor: theme.text, opacity: 0.3 }]} />
                <Text style={[styles.typingText, { color: theme.secondaryText }]}>Vanguard is thinking...</Text>
              </View>
            </Animated.View>
          ) : null
        }
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.inputContainer, { borderTopColor: theme.secondaryBackground }]}>
          {selectedImage && (
            <View style={styles.imagePreviewWrapper}>
              <View style={[styles.imagePreview, { overflow: 'hidden', borderRadius: 12 }]}>
                <ImageIcon size={24} color={theme.text} />
              </View>
              <TouchableOpacity 
                style={[styles.removeImageBtn, { backgroundColor: theme.text }]}
                onPress={() => setSelectedImage(null)}
              >
                <X size={14} color={theme.background} />
              </TouchableOpacity>
            </View>
          )}


          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={UNIVERSAL_SUGGESTIONS}
            keyExtractor={(item) => item}
            style={styles.suggestionList}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.suggestionChip, { backgroundColor: theme.secondaryBackground }]}
                onPress={() => sendMessage(item)}
              >
                <Text style={[styles.suggestionText, { color: theme.text }]}>{item}</Text>
              </TouchableOpacity>
            )}
          />

          <View style={styles.toolbar}>
            <TouchableOpacity style={styles.toolBtn}>
              <Plus size={20} color={theme.secondaryText} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn} onPress={pickImage}>
              <ImageIcon size={20} color={selectedImage ? theme.text : theme.secondaryText} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}>
              <Paperclip size={20} color={theme.secondaryText} />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={[styles.toolBtn, { backgroundColor: theme.secondaryBackground, borderRadius: 10, paddingHorizontal: 12 }]}>
              <Cpu size={14} color={theme.text} />
              <Text style={{ fontSize: 10, fontWeight: '700', marginLeft: 6, color: theme.text }}>VANGUARD-4.2</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputBox, { backgroundColor: theme.secondaryBackground }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="What's your query for Vanguard Core?"
              placeholderTextColor={theme.secondaryText}
              value={inputText}
              onChangeText={setInputText}
              multiline
              textAlignVertical="center"
              onSubmitEditing={() => {
                if (inputText.trim()) sendMessage();
              }}
              blurOnSubmit={false}
              onKeyPress={(e: any) => {
                if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputText.trim()) sendMessage();
                }
              }}
            />
            <TouchableOpacity 
              style={[
                styles.sendBtn, 
                { backgroundColor: theme.text }, 
                (!inputText.trim() && !selectedImage) && { opacity: 0.3 }
              ]} 
              onPress={() => sendMessage()}
              disabled={!inputText.trim() && !selectedImage}
            >
              <ArrowRight size={20} color={theme.background} />
            </TouchableOpacity>
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
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerName: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerStatus: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  list: {
    padding: 16,
    paddingBottom: 20,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
  bubbleWrapper: {
    marginBottom: 20,
    maxWidth: '85%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  aiWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    borderBottomLeftRadius: 6,
  },
  codeBubble: {
    width: '100%',
    borderWidth: 1,
  },
  msgText: {
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    opacity: 0.4,
  },
  actionBtn: {
    padding: 2,
  },
  typingContainer: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    gap: 10,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  typingText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    borderTopWidth: 0,
  },
  suggestionList: {
    marginBottom: 12,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  toolBtn: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingHorizontal: 0,
    fontWeight: '600',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' } as any),
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  aiImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  imagePreviewWrapper: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBubble: {
    width: 150,
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    left: 64,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
