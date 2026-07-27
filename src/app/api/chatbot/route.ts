import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

function getFallbackReply(message: string) {
  const msgLower = message.toLowerCase();
  
  if (msgLower.includes("tnea") || msgLower.includes("counselling") || msgLower.includes("choice")) {
    return (
      "TNEA 2026 counselling choice filling for Round 1 starts on July 15, 2026. " +
      "You should list premium institutes like Anna University (CEG), PSG Tech, and SSN at the top. " +
      "Do you need help ordering your choices?"
    );
  }
  
  if (msgLower.includes("scholarship") || msgLower.includes("waiver") || msgLower.includes("free")) {
    return (
      "For Tamil Nadu students, the TNEA First Graduate Fee Waiver covers 100% of tuition fees. " +
      "There is also the Post-Matric SC/ST scholarship (parent income under 2.5L) and national portals. " +
      "Which one matches your profile?"
    );
  }
  
  if (msgLower.includes("vit") || msgLower.includes("vellore") || msgLower.includes("srm")) {
    return (
      "VIT Vellore is currently concluding its Phase 4 seats confirmation and hostel allotments. " +
      "If you are looking for private alternatives, SRM IST and SASTRA University are excellent choices with strong packages."
    );
  }
  
  if (msgLower.includes("fee") || msgLower.includes("budget") || msgLower.includes("cost")) {
    return (
      "Government institutions like Anna University have fees around Rs. 55,000/year, " +
      "while private universities like VIT Vellore can go up to Rs. 2.0 Lakhs to Rs. 4.5 Lakhs/year. " +
      "What is your target budget so we can filter match choices?"
    );
  }

  return (
    "Hello! I am your C2Talents Admissions Advisor. I can guide you on engineering cutoffs, " +
    "TNEA choice filling, scholarships, and placement ROI. What is your academic stream and score?"
  );
}

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ reply: getFallbackReply(message) });
    }

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: 
          "You are 'C2Talents Admissions Assistant', a premium, highly experienced college advisor specializing " +
          "in the Indian higher education ecosystem (specifically Tamil Nadu college admissions, TNEA counselling, " +
          "JEE Main, CAT exams, scholarship portals, and placement metrics). " +
          "Your tone is warm, professional, extremely concise (2-3 sentences), and data-driven. " +
          "Never mention raw markdown formatting tags or code instructions. " +
          "Provide accurate advice based on current dates (it is currently July 2026) and counselling cycles."
      });

      // Prepare conversation history for Gemini SDK
      // The SDK expects chat history format: { role: 'user'|'model', parts: [{ text: string }] }
      const formattedHistory = (history || []).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(message);
      const reply = result.response.text();

      return NextResponse.json({ reply: reply.trim() });
    } catch (apiError) {
      console.error("Gemini Chat API Error:", apiError);
      return NextResponse.json({ reply: getFallbackReply(message) });
    }
  } catch (error: any) {
    console.error("Chatbot router error:", error);
    return NextResponse.json(
      { message: "Failed to process chat conversation" },
      { status: 500 }
    );
  }
}
