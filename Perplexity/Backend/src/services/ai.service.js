import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import * as z from "zod";
import { searchInternet } from "./internet.service.js";

// ── Models ───────────────────────────────────────────────────────
const geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey: process.env.GEMINI_API_KEY
});

const mistralModel = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
});

// ── Tools ────────────────────────────────────────────────────────
const searchInternetTool = tool(
    searchInternet,
    {
        name: "searchInternet",
        description: "Use this tool to get the latest information from the internet.",
        schema: z.object({
            query: z.string().describe("The search query to look up on the internet.")
        })
    }
);

const agent = createReactAgent({
    llm: mistralModel,
    tools: [searchInternetTool],
});

// ── Helper: map DB messages to LangChain messages ────────────────
function toLangChainMessages(messages) {
    return messages
        .map(msg => {
            if (msg.role === "user") return new HumanMessage(msg.content);
            if (msg.role === "ai")   return new AIMessage(msg.content);
            return null;
        })
        .filter(Boolean);
}

// ── Streaming Response (token by token) ──────────────────────────
export async function generateResponseStream(messages, onChunk) {
    const stream = await agent.stream(
        {
            messages: [
                new SystemMessage(`
                    You are a helpful and precise assistant for answering questions.
                    If you don't know the answer, say you don't know.
                    If the question requires up-to-date information, use the "searchInternet" tool.
                `),
                ...toLangChainMessages(messages)
            ]
        },
        { streamMode: "messages" }  // ← token-by-token streaming
    );

    for await (const [chunk, metadata] of stream) {
        // Only forward final AI text tokens — skip tool call chunks
        if (
            chunk.content &&
            metadata?.langgraph_node === "agent" &&
            !chunk.tool_calls?.length
        ) {
            onChunk(chunk.content);
        }
    }
}

// ── Non-streaming Response (for internal use) ────────────────────
export async function generateResponse(messages) {
    const response = await agent.invoke({
        messages: [
            new SystemMessage(`
                You are a helpful and precise assistant for answering questions.
                If you don't know the answer, say you don't know.
                If the question requires up-to-date information, use the "searchInternet" tool.
            `),
            ...toLangChainMessages(messages)
        ]
    });
    return response.messages[response.messages.length - 1].content;
}

// ── Chat Title Generator ─────────────────────────────────────────
export async function generateChatTitle(message) {
    const response = await mistralModel.invoke([
        new SystemMessage(`
            Generate a concise title (2-4 words) for a chat.
            Return ONLY plain text title, NO markdown, NO asterisks, NO quotes.
        `),
        new HumanMessage(`First message: "${message}"`)
    ]);
    return response.content.replace(/\*/g, '').trim();
}

// ── Life OS AI Advisor ───────────────────────────────────────────
export async function getLifeOSAdvice({ habits, moods, spendings }) {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7.push(d.toISOString().split('T')[0]);
    }

    const habitSummary = habits.map(h => ({
        name: h.name,
        category: h.category,
        streak: h.currentStreak,
        completionLast7: last7.filter(d => h.completedDates.includes(d)).length + "/7"
    }));

    const moodSummary = moods.map(m => ({
        date: m.date,
        score: m.score,
        label: m.label,
        energy: m.energy,
        stress: m.stress,
        note: m.note
    }));

    const avgMood = moods.length
        ? (moods.reduce((s, m) => s + m.score, 0) / moods.length).toFixed(1)
        : null;

    const avgStress = moods.filter(m => m.stress).length
        ? (moods.filter(m => m.stress).reduce((s, m) => s + m.stress, 0) / moods.filter(m => m.stress).length).toFixed(1)
        : null;

    const spendByCategory = spendings.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + s.amount;
        return acc;
    }, {});

    const totalSpent = spendings.reduce((s, t) => s + t.amount, 0);

    const prompt = `
You are a personal AI life advisor. Analyze the user's data from the past 7 days and provide a comprehensive daily briefing.

## User Data

### Habits (Last 7 days)
${JSON.stringify(habitSummary, null, 2)}

### Mood Log
- Average mood: ${avgMood}/10
- Average stress: ${avgStress}/10
- Recent entries: ${JSON.stringify(moodSummary, null, 2)}

### Spending (Recent)
- Total spent: ₹${totalSpent}
- By category: ${JSON.stringify(spendByCategory, null, 2)}

## Your Task
Provide a structured daily briefing in this EXACT JSON format:

{
  "greeting": "Short personalized greeting (1 sentence)",
  "overallScore": <number 1-100>,
  "burnoutRisk": "low | medium | high",
  "burnoutReason": "1-2 sentence explanation",
  "insights": [
    { "type": "habit | mood | spending | warning", "title": "...", "body": "..." }
  ],
  "todaysPriorities": ["priority 1", "priority 2", "priority 3"],
  "advice": "2-3 sentence personalized advice for today",
  "predictions": {
    "productivityTomorrow": "low | medium | high",
    "reason": "..."
  }
}

Return ONLY valid JSON, no markdown, no explanation.
`;

    try {
        const response = await geminiModel.invoke([
            new SystemMessage("You are a personal AI life advisor. Return only valid JSON."),
            new HumanMessage(prompt)
        ]);
        const text = response.content.replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error("Life OS advice error:", err.message);
        return {
            greeting: "Good day! Here's your daily summary.",
            overallScore: 70,
            burnoutRisk: "low",
            burnoutReason: "Not enough data to predict yet. Keep logging!",
            insights: [
                { type: "habit", title: "Keep it up!", body: "Stay consistent with your habits." }
            ],
            todaysPriorities: ["Log your mood", "Complete your habits", "Track spending"],
            advice: "Start small and stay consistent. Every data point helps me give you better advice.",
            predictions: { productivityTomorrow: "medium", reason: "Need more data." }
        };
    }
}