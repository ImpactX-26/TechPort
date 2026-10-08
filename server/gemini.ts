import { GoogleGenAI, Type } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  geminiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  return geminiClient;
}

export async function callGeminiStructured<T>(params: {
  prompt: string;
  systemInstruction?: string;
  responseSchema?: any;
  fallbackGenerator: () => T;
}): Promise<{ data: T; source: 'gemini_api' | 'deterministic_agent' }> {
  const client = getGeminiClient();
  if (!client) {
    return { data: params.fallbackGenerator(), source: 'deterministic_agent' };
  }

  try {
    const config: any = {
      responseMimeType: 'application/json',
      systemInstruction: params.systemInstruction || 'You are an expert AI agent in German immigration, higher education, and skilled labor pathways.',
    };

    if (params.responseSchema) {
      config.responseSchema = params.responseSchema;
    }

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out')), 9000)
    );

    const generatePromise = client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: params.prompt,
      config,
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const text = response.text;
    if (!text) {
      return { data: params.fallbackGenerator(), source: 'deterministic_agent' };
    }

    const parsed = JSON.parse(text) as T;
    return { data: parsed, source: 'gemini_api' };
  } catch (error) {
    console.warn('Gemini API call encountered an issue, gracefully falling back to deterministic agent:', error);
    return { data: params.fallbackGenerator(), source: 'deterministic_agent' };
  }
}

export async function callGeminiText(params: {
  prompt: string;
  systemInstruction?: string;
  fallbackText: string;
}): Promise<string> {
  const client = getGeminiClient();
  if (!client) {
    return params.fallbackText;
  }

  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out')), 9000)
    );

    const generatePromise = client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: params.prompt,
      config: {
        systemInstruction: params.systemInstruction || 'You are a senior mentor guiding international students in Germany.',
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    return response.text || params.fallbackText;
  } catch (err) {
    console.warn('Gemini text generation failed, using senior persona fallback:', err);
    return params.fallbackText;
  }
}

