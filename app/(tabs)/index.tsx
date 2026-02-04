import { Theme } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import {
    ArrowRight,
    BrainCircuit,
    Code,
    Globe,
    MessageSquare,
    Zap
} from 'lucide-react-native';
import {
    Dimensions,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    Layout
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function PremiumPortalScreen() {
  const router = useRouter();
  const { mode } = useAppTheme();
  const theme = Theme[mode];

  const startNewChat = (initialMsg?: string) => {
    router.push({ 
      pathname: '/chat/[id]', 
      params: { 
        id: `vcore_${Date.now()}`, 
        name: 'Vanguard Core', 
        category: 'universal',
        initialMessage: initialMsg || ''
      } 
    });
  };

  const SUGGESTIONS = [
    { title: 'Write Code', icon: Code, color: '#3B82F6' },
    { title: 'Scientific Insight', icon: BrainCircuit, color: '#8B5CF6' },
    { title: 'Global Trends', icon: Globe, color: '#10B981' },
    { title: 'Neural Session', icon: Zap, color: '#F59E0B' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Background Accent */}
      <View style={[styles.bgAccent, { backgroundColor: theme.text, opacity: 0.03 }]} />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.main}>
          {/* Header Branding */}
          <Animated.View entering={FadeIn.delay(100).duration(800)} style={styles.header}>
              <View style={[styles.logoBox, { backgroundColor: theme.text }]}>
                  <Zap size={18} color={theme.background} fill={theme.background} />
              </View>
              <Text style={[styles.nexusText, { color: theme.text }]}>Nexus Core</Text>
          </Animated.View>

          {/* Hero Greeting */}
          <View style={styles.hero}>
            <Animated.Text 
              entering={FadeInDown.delay(300).duration(800)} 
              style={[styles.greeting, { color: theme.text }]}
            >
              How can I enhance{'\n'}your intelligence?
            </Animated.Text>
            <Animated.Text 
              entering={FadeInDown.delay(400).duration(800)} 
              style={[styles.subGreeting, { color: theme.secondaryText }]}
            >
              Integrated with Vanguard Core 2.5 Stable Flash
            </Animated.Text>
          </View>

          {/* Primary Input Action */}
          <Animated.View 
            entering={FadeInDown.delay(500).duration(800)}
            layout={Layout.springify()}
            style={styles.inputWrapper}
          >
              <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={() => startNewChat()}
                style={[styles.inputButton, { backgroundColor: theme.secondaryBackground }]}
              >
                  <MessageSquare size={20} color={theme.secondaryText} />
                  <Text style={[styles.inputText, { color: theme.secondaryText }]}>Ask anything to Vanguard...</Text>
                  <View style={[styles.sendIcon, { backgroundColor: theme.text }]}>
                      <ArrowRight size={16} color={theme.background} />
                  </View>
              </TouchableOpacity>
          </Animated.View>

          {/* Suggestion Chips Grid */}
          <View style={styles.gridContainer}>
            <View style={styles.grid}>
              {SUGGESTIONS.map((item, index) => (
                <Animated.View 
                  key={item.title} 
                  entering={FadeInDown.delay(600 + index * 100).duration(800)}
                  style={styles.cardWrapper}
                >
                  <TouchableOpacity 
                    style={[styles.card, { backgroundColor: theme.secondaryBackground }]}
                    onPress={() => startNewChat(item.title)}
                  >
                    <View style={[styles.cardIcon, { backgroundColor: `${item.color}20` }]}>
                        <item.icon size={20} color={item.color} />
                    </View>
                    <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Aesthetic Footer */}
      <View style={styles.footer}>
         <View style={styles.footerLine} />
         <View style={styles.footerContent}>
            <Text style={[styles.footerText, { color: theme.secondaryText }]}>NEXUS NEURAL INTERFACE ALPHA</Text>
            <View style={styles.statusRow}>
               <View style={styles.statusDot} />
               <Text style={[styles.statusText, { color: theme.text }]}>ONLINE</Text>
            </View>
         </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgAccent: {
    position: 'absolute',
    top: -width * 0.5,
    right: -width * 0.3,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
  },
  main: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 60,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nexusText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  hero: {
    marginBottom: 40,
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: 12,
    textAlign: 'left',
  },
  subGreeting: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
    textAlign: 'left',
  },
  inputWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  inputButton: {
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  sendIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  cardWrapper: {
    width: '50%',
    padding: 6,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  footer: {
    padding: 24,
    paddingTop: 0,
  },
  footerLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 20,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    opacity: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
