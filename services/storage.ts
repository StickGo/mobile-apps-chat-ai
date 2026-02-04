import AsyncStorage from '@react-native-async-storage/async-storage';

const CHATS_KEY = '@chat_history';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
  image?: string;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  messages: ChatMessage[];
  category?: string;
  systemPrompt?: string;
}

export const saveConversation = async (conversation: Conversation) => {
  try {
    const existingChatsJson = await AsyncStorage.getItem(CHATS_KEY);
    let chats: Record<string, Conversation> = existingChatsJson ? JSON.parse(existingChatsJson) : {};
    
    chats[conversation.id] = conversation;
    
    await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
};

export const getConversation = async (id: string): Promise<Conversation | null> => {
  try {
    const existingChatsJson = await AsyncStorage.getItem(CHATS_KEY);
    if (!existingChatsJson) return null;
    
    const chats: Record<string, Conversation> = JSON.parse(existingChatsJson);
    return chats[id] || null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    return null;
  }
};

export const getAllConversations = async (): Promise<Conversation[]> => {
  try {
    const existingChatsJson = await AsyncStorage.getItem(CHATS_KEY);
    if (!existingChatsJson) return [];
    
    const chats: Record<string, Conversation> = JSON.parse(existingChatsJson);
    return Object.values(chats).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error getting all conversations:', error);
    return [];
  }
};

export const deleteConversation = async (id: string) => {
  try {
    const existingChatsJson = await AsyncStorage.getItem(CHATS_KEY);
    if (!existingChatsJson) return;
    
    let chats: Record<string, Conversation> = JSON.parse(existingChatsJson);
    delete chats[id];
    
    await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Error deleting conversation:', error);
  }
};

export const clearAllConversations = async () => {
  try {
    await AsyncStorage.setItem(CHATS_KEY, JSON.stringify({}));
  } catch (error) {
    console.error('Error clearing all conversations:', error);
  }
};

// System Prompt Settings
const SYSTEM_PROMPT_KEY = '@system_prompt';

export const saveSystemPrompt = async (prompt: string) => {
  try {
    await AsyncStorage.setItem(SYSTEM_PROMPT_KEY, prompt);
  } catch (error) {
    console.error('Error saving system prompt:', error);
  }
};

export const getSystemPrompt = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(SYSTEM_PROMPT_KEY);
  } catch (error) {
    console.error('Error getting system prompt:', error);
    return null;
  }
};
