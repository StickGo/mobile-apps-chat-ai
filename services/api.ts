
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  image?: string;
  imagePrompt?: string;
  error?: string;
}

export async function* sendMessageToAIStream(
  message: string, 
  history: Message[] = [],
  customPrompt?: string,
  image?: string,
  mimeType?: string,
  category?: string
): AsyncGenerator<{ type: 'text' | 'json'; data: string | ChatResponse }> {
  try {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        customPrompt,
        image,
        mimeType,
        category
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch response from AI');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (!reader) {
      throw new Error('Response body is null');
    }

    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      
      // Check for the special JSON marker for tool calls
      if (chunk.includes('__JSON__')) {
        const parts = chunk.split('__JSON__');
        if (parts[0]) yield { type: 'text', data: parts[0] };
        try {
          const jsonData = JSON.parse(parts[1]);
          yield { type: 'json', data: jsonData };
        } catch (e) {
          console.error('Error parsing JSON chunk:', e);
        }
        return; // Tool call ends the stream
      }

      yield { type: 'text', data: chunk };
    }
  } catch (error: any) {
    const errorMessage = error instanceof TypeError && error.message.includes('fetch') 
      ? `Failed to connect to AI server at ${API_URL}. Please ensure the backend is running.` 
      : error.message || 'An unexpected error occurred';

    yield { 
      type: 'json', 
      data: { 
        success: false, 
        message: '', 
        error: errorMessage
      } 
    };
  }
}

// For backward compatibility or non-streaming use cases
export const sendMessageToAI = async (message: string, history: Message[] = []): Promise<ChatResponse> => {
  const generator = sendMessageToAIStream(message, history);
  let fullText = "";
  for await (const chunk of generator) {
    if (chunk.type === 'json') return chunk.data as ChatResponse;
    fullText += chunk.data as string;
  }
  return { success: true, message: fullText };
};
