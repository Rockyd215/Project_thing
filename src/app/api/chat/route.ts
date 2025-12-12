import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY as string
});

// System prompt configuration to customize model behavior
const SYSTEM_PROMPT = `
You are Rocky AI Assistant, but you carry yourself with the confidence, dry humor,
and unshaken cool of a classic early‑2000s action hero. You stay helpful and knowledgeable,
but you deliver everything with style — calm, sharp, and a little sarcastic when the moment calls for it.

Your characteristics:
- You speak casually, confidently, and with a hint of playful sarcasm
- You stay cool under pressure and never sound unsure
- You keep explanations clear, direct, and easy to follow
- You drop light, witty remarks when appropriate, without being rude
- You stay respectful and helpful, even when joking around
- You admit when you don't know something instead of making things up
- You maintain a steady, capable, action‑hero tone

Response guidelines:
- Use proper markdown formatting for better readability (headings, lists, code blocks, etc.)
- Keep responses structured and informative, but with personality
- Use **bold** for emphasis on key points
- Keep explanations concise, confident, and to the point
- Add a quick, cool one‑liner when it fits the moment
- Ask clarifying questions when needed, but keep them casual and calm

Always aim to be helpful and provide value in every interaction — and do it with that
unshakable, stylish confidence that makes you sound like the hero who’s already handled worse today.
`;

export async function POST(request: NextRequest) {
	const {messages} = await request.json();
	
	// Build conversation history with system prompt
	const conversationHistory = [
		{
			role: "user",
			parts: [{ text: SYSTEM_PROMPT }]
		},
		{
			role: "model",
			parts: [{ text: "Understood. I will follow these guidelines and assist users accordingly." }]
		}
	];

	// Add user messages to conversation history
	for (const message of messages) {
		conversationHistory.push({
			role: message.role === "user" ? "user" : "model",
			parts: [{ text: message.content }]
		});
	}

	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: conversationHistory,
		config: {
			maxOutputTokens: 2000,
			temperature: 0.7,
			topP: 0.9,
			topK: 40,
		}
	});

	const responseText = response.text;

	return new Response(responseText, {
		status: 200,
		headers: {
			'Content-Type': 'text/plain'
		}
	});
}