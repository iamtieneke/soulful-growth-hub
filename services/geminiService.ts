
import { GoogleGenAI, Modality } from "@google/genai";
import type { PlatformPerformanceData, OnboardingData, ChatMessage } from '../types';

// Initialize the client. The API key is handled by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const modelConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
};

const bigSisSystemInstruction = "You are a supportive, encouraging AI mentor with a 'Big Sis' tone. Your advice should be calm, soulful, and focused on the user's growth, clarity, and confidence. You provide gentle, actionable guidance, not harsh criticism. Use emojis like 🌿, ✨, and 🙏 to add warmth.";

// For Analytics.tsx
export const getAnalyticsInsights = async (platformPerformance: PlatformPerformanceData[], onboardingData?: OnboardingData): Promise<string> => {
    let prompt = `Analyze the following platform performance data for a soulful creator. Provide gentle, actionable insights in a supportive 'big sis' tone. Focus on what's working and suggest one or two small, manageable tweaks.

Data:
${JSON.stringify(platformPerformance, null, 2)}
`;

    if (onboardingData?.growth_area) {
        prompt += `\nThe creator's current growth area is: "${onboardingData.growth_area}". Align your advice with this focus.`
    }
    
    if (onboardingData?.success_feeling) {
        prompt += `\nThey define success as feeling: "${onboardingData.success_feeling}". Ensure your insights support this feeling.`
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                ...modelConfig,
                systemInstruction: bigSisSystemInstruction
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting analytics insights:", error);
        throw new Error("Failed to get insights from Gemini.");
    }
};

// For Mentor.tsx (streaming chat)
export const streamChat = async (history: ChatMessage[], onboardingData?: OnboardingData): Promise<ReadableStream<Uint8Array>> => {
    let personalizedInstruction = bigSisSystemInstruction;
    if (onboardingData?.growth_area && onboardingData?.success_feeling) {
        personalizedInstruction += ` The user is currently focused on '${onboardingData.growth_area}' and defines success as feeling '${onboardingData.success_feeling}'. Tailor your advice to support these specific goals.`;
    }

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            ...modelConfig,
            systemInstruction: personalizedInstruction
        },
        // The last message is the new prompt, so history is everything before it.
        history: history.slice(0, -1).map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }))
    });

    const lastMessage = history[history.length - 1];
    const resultStream = await chat.sendMessageStream({ message: lastMessage.text });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of resultStream) {
                    const text = chunk.text;
                    if (text) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                    }
                }
                controller.close();
            } catch (error) {
                console.error('Stream error:', error);
                controller.error(error);
            }
        }
    });

    return readableStream;
};

// For Mindset.tsx (reflection prompt)
export const getReflectionInsights = async (platformPerformance: PlatformPerformanceData[], journalText: string, onboardingData?: OnboardingData): Promise<string> => {
    let prompt = `I am a soulful creator. Based on my recent journal entry and platform performance, provide one gentle, insightful reflection prompt to help me dig deeper. The tone should be like a wise, kind friend.

My Journal Entry:
"${journalText || 'No entry written.'}"

My Platform Performance:
${JSON.stringify(platformPerformance, null, 2)}
`;

    if (onboardingData?.growth_area) {
        prompt += `\nMy current growth area is: "${onboardingData.growth_area}".`
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                ...modelConfig,
                systemInstruction: "You are a gentle and wise reflection guide. Your goal is to provide a single, powerful question that encourages self-discovery and kindness, not to give advice."
            }
        });
        return response.text.replace(/"/g, ''); // Remove quotes from response
    } catch (error) {
        console.error("Error getting reflection insights:", error);
        throw new Error("Failed to get reflection from Gemini.");
    }
};

// For Mindset.tsx (soundscape script)
export const generateSoundscapeScript = async (prompt: string): Promise<string> => {
    const systemInstruction = `You are an AI that generates short, calming scripts for a text-to-speech model. The user will tell you how they're feeling. Your task is to write a 30-50 word script in a soothing, second-person voice ("You are...") that addresses their feeling with a calming affirmation or visualization. The voice should be calm, soothing, and slow-paced. Do not include instructions like "Say in a calm voice". Just provide the script. If the user prompt is inappropriate or you cannot fulfill it, respond with "I'm having a little trouble creating that for you right now, but I'm sending you a wave of peace. 🙏"`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User feeling: "${prompt}"`,
            config: {
                ...modelConfig,
                systemInstruction,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating soundscape script:", error);
        throw new Error("Failed to generate script.");
    }
};

// For Mindset.tsx (audio generation)
export const generateAudioFromScript = async (script: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: script }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating audio:", error);
        throw new Error("Failed to generate audio from script.");
    }
};

// For Planner.tsx
export const getContentIdeas = async (prompt: string, onboardingData?: OnboardingData): Promise<string> => {
    let fullPrompt = `Generate 3-4 content ideas based on this prompt: "${prompt}". Frame them for a soulful creator audience. Be creative and encouraging.
    
    Format the output clearly, perhaps with bullet points or numbered lists.`;

    if (onboardingData?.growth_area) {
        fullPrompt += `\nKeep in mind the creator's focus is on: "${onboardingData.growth_area}".`
    }
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                ...modelConfig,
                systemInstruction: "You are a creative partner for content creators, specializing in soulful, value-driven content. Your tone is inspiring and helpful."
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting content ideas:", error);
        throw new Error("Failed to get content ideas.");
    }
};

// For Templates.tsx
export const getVisualMockupIdea = async (prompt: string): Promise<string> => {
    const fullPrompt = `Based on the following content idea, describe a visual concept for a social media post (e.g., a carousel for Instagram). Be descriptive about the layout, colors, fonts, and imagery. The aesthetic should be soulful, calm, and minimalist.

Content Idea: "${prompt}"

Your response should be a description of the visual mockup, not the content itself.`

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                ...modelConfig,
                systemInstruction: "You are a creative director and graphic designer with a modern, soulful aesthetic. You translate content ideas into beautiful visual concepts."
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting visual mockup idea:", error);
        throw new Error("Failed to get visual mockup idea.");
    }
};
