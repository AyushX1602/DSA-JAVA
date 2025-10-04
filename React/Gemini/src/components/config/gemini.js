import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

const MODEL_NAME = 'gemini-1.5-flash';
const API_KEY = "AIzaSyAxtqLhxy41eolvpVe1xqlzf4r99xb-iyE";

async function runChat(prompt) {
  console.log('Attempting to call Gemini API with prompt:', prompt);
  
  if (!API_KEY) {
    console.error('API_KEY is missing');
    return 'API key is not configured';
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    console.log('Model initialized successfully');

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [],
    });
    
    console.log('Sending message to Gemini...');
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();
    console.log('Gemini Response:', text);
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    console.error('Error details:', error.message);
    
    // Handle specific error types
    if (error.message.includes('503') || error.message.includes('overloaded')) {
      return 'The AI service is currently busy. Please try again in a few moments.';
    } else if (error.message.includes('401') || error.message.includes('API key')) {
      return 'Authentication error. Please check your API key configuration.';
    } else if (error.message.includes('Failed to fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    } else {
      return 'Sorry, I encountered an error while processing your request. Please try again.';
    }
  }
}

export default runChat;
