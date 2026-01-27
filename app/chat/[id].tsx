import { Theme } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Check,
  ChevronLeft,
  Copy,
  Cpu,
  Image as ImageIcon,
  MoreVertical,
  Paperclip,
  Plus,
  Send,
  Share2,
  Trash2,
  Zap
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
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
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';

const SUGGESTIONS: Record<string, string[]> = {
  sports: ["Analyze my workout", "Plan a 5k run", "Diet for athletes", "Injury prevention"],
  health: ["Sleep optimization", "Hydration goals", "Mental wellness", "Nutrient guide"],
  games: ["Optimize my loadout", "Strategy for Boss", "Patch breakdown", "Best meta items"],
  work: ["Draft an email", "Summarize notes", "Meeting agenda", "Project timeline"],
  default: ["Explain Quantum", "Code a Python script", "Write a haiku", "Career advice"]
};

export default function ChatDetailScreen() {
  const { id, name, category } = useLocalSearchParams();
  const router = useRouter();
  const { mode } = useAppTheme();
  const theme = Theme[mode];
  
  const [messages, setMessages] = useState([
    { id: '1', text: `Systems synchronized. I am ${name}. Current Protocol: ${category || 'General'}. How may I assist your operations?`, sender: 'ai', timestamp: '10:30 AM' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = (text = inputText) => {
    if (text.trim() === '') return;
    
    const userMsg = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI Thought Process Simulation
    const phases = ['Analysing...', 'Verifying Data...', 'Synthesizing...'];
    let phaseIdx = 0;
    const phaseInterval = setInterval(() => {
      setThinkingPhase(phases[phaseIdx]);
      phaseIdx++;
      if (phaseIdx >= phases.length) clearInterval(phaseInterval);
    }, 500);

    setTimeout(() => {
      let response = "Analysis complete. Optimization successful.";
      if (text.toLowerCase().includes('code')) {
        response = "```javascript\n// Optimized function\nconst syncData = (id) => {\n  return fetch(`/api/sync/${id}`);\n};\n```";
      } else if (text.toLowerCase().includes('summarize')) {
        response = "**Summary:**\n1. Initial sync established.\n2. Data integrity verified.\n3. Latency reduced by 12%.";
      }

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setIsTyping(false);
      setThinkingPhase('');
    }, 2000);
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

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter(m => m.id !== id));
  };

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isTyping]);

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isUser = item.sender === 'user';
    const isCode = item.text.startsWith('```');
    
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
          
          <View style={styles.bubbleFooter}>
            <Text style={[styles.timeLabel, { color: isUser ? 'rgba(255,255,255,0.4)' : theme.secondaryText }]}>
              {item.timestamp}
            </Text>
            
            {!isUser && (
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => copyToClipboard(item.id, item.text)} style={styles.actionBtn}>
                  {copiedId === item.id ? <Check size={12} color={theme.text} /> : <Copy size={12} color={theme.secondaryText} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => shareMessage(item.text)} style={styles.actionBtn}>
                  <Share2 size={12} color={theme.secondaryText} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteMessage(item.id)} style={styles.actionBtn}>
                  <Trash2 size={12} color={theme.secondaryText} />
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
            <Text style={[styles.headerName, { color: theme.text }]}>{name || 'Chat'}</Text>
            <Zap size={14} color={theme.text} fill={theme.text} style={{ marginLeft: 6 }} />
          </View>
          {isTyping ? (
            <Text style={[styles.headerStatus, { color: theme.text, fontWeight: '700' }]}>{thinkingPhase || 'Thinking...'}</Text>
          ) : (
            <Text style={[styles.headerStatus, { color: theme.secondaryText }]}>Vanguard Protocol v4.2</Text>
          )}
        </View>
        <TouchableOpacity style={styles.backBtn}>
          <MoreVertical size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {isTyping && (
        <Animated.View entering={FadeIn} style={styles.typingContainer}>
           <View style={[styles.typingDot, { backgroundColor: theme.text }]} />
           <View style={[styles.typingDot, { backgroundColor: theme.text, opacity: 0.5 }]} />
           <View style={[styles.typingDot, { backgroundColor: theme.text, opacity: 0.2 }]} />
        </Animated.View>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.inputContainer, { borderTopColor: theme.secondaryBackground }]}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={SUGGESTIONS[(category as string) || 'default']}
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
            <TouchableOpacity style={styles.toolBtn}>
              <ImageIcon size={20} color={theme.secondaryText} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolBtn}>
              <Paperclip size={20} color={theme.secondaryText} />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={[styles.toolBtn, { backgroundColor: theme.secondaryBackground, borderRadius: 10, paddingHorizontal: 12 }]}>
              <Cpu size={14} color={theme.text} />
              <Text style={{ fontSize: 10, fontWeight: '700', marginLeft: 6, color: theme.text }}>GPT-VANGUARD</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.inputBox, { backgroundColor: theme.secondaryBackground }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Query specialized engine..."
              placeholderTextColor={theme.secondaryText}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, { backgroundColor: theme.text }, !inputText.trim() && { opacity: 0.2 }]} 
              onPress={() => sendMessage()}
              disabled={!inputText.trim()}
            >
              <Send size={18} color={theme.background} />
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
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  codeBubble: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  msgText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
  },
  typingContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 4,
    marginBottom: 10,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
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
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingHorizontal: 10,
    fontWeight: '600',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
