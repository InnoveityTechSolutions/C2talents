"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Bot, User, Star, MapPin, Award, TrendingUp,
  CheckCircle, ArrowRight, RefreshCw, Info, ExternalLink, Scale, Check, X, Bookmark, Globe, Building2, Shield, Zap, CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface Message {
  role: "bot" | "user";
  content: string;
  chips?: string[];
}

interface StudentProfile {
  stream?: string | null;
  score12th?: string | null;
  cutoff?: string | null;
  entranceExam?: string | null;
  specialization?: string | null;
  locationPreference?: string | null;
  budget?: string | null;
  hostel?: string | null;
  ownershipPreference?: string | null;
  expectedPackage?: string | null;
  category?: string | null;
  quota?: string | null;
}

interface Recommendation {
  id: string;
  name: string;
  shortName: string | null;
  slug: string | null;
  logo: string | null;
  image: string;
  banner: string | null;
  location: string;
  city: string | null;
  state: string;
  type: string;
  ownership: string | null;
  fees: number;
  courseWiseFees: string | null;
  hostelFees: number | null;
  avgPackage: number;
  highestPackage: number;
  naacGrade: string | null;
  nirfRank: number | null;
  approval: string | null;
  hostelAvailable: boolean;
  website: string | null;
  matchScore: number;
  matchReasons: string[];
  rationale: string;
}

const STEPS = [
  {
    key: "stream",
    question: "Hello 👋 I am Leo Bot, your Admission Assistant.\n\nI will help you find the best verified colleges based on your academic profile.\n\nStep 1: Which academic stream are you interested in?",
    chips: ["Engineering", "Arts & Science", "Medical", "Law", "Management", "Commerce", "Agriculture", "Architecture"],
  },
  {
    key: "score12th",
    question: "What is your Class 12th / HSC percentage or Cutoff score (PCM/PCB)?",
    chips: ["95%+ (Cutoff 190+)", "90–95% (Cutoff 180+)", "85–90% (Cutoff 170+)", "75–85% (Cutoff 150+)", "Below 75%"],
  },
  {
    key: "entranceExam",
    question: "Which entrance exam or admission process are you following?",
    chips: ["TNEA Counselling", "JEE Main", "NEET UG", "CUET", "CAT / MAT", "No Entrance (Merit Based)"],
  },
  {
    key: "specialization",
    question: "Which course or specialization interests you the most?",
    chips: ["Computer Science & AI", "Electronics & Communication", "Biotechnology", "MBA / Management", "BCA / Information Technology", "Mechanical Engineering"],
  },
  {
    key: "locationPreference",
    question: "What is your preferred location (City / District)?",
    chips: ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Any Location in Tamil Nadu"],
  },
  {
    key: "budget",
    question: "What is your maximum annual tuition fee budget limit?",
    chips: ["Under ₹1L / yr", "₹1L – ₹2L / yr", "₹2L – ₹4L / yr", "₹4L+ / yr", "Open to scholarships"],
  },
  {
    key: "hostel",
    question: "Do you need on-campus hostel facilities?",
    chips: ["Yes — On-campus hostel required", "No — Day scholar / commuting"],
  },
  {
    key: "ownershipPreference",
    question: "What is your college type / status preference?",
    chips: ["Government / Govt-Aided", "Autonomous Institutions", "Top Private Universities", "No Preference"],
  },
  {
    key: "expectedPackage",
    question: "What is your target placement package expectation after graduation?",
    chips: ["₹4–6 LPA", "₹6–10 LPA", "₹10–15 LPA", "₹15+ LPA", "Not focused on placement"],
  },
  {
    key: "category",
    question: "Finally, select your Category / Reservation Quota if applicable:",
    chips: ["OC / General", "BC / BCM", "MBC / DNC", "SC / ST", "First Graduate Quota", "Sports Quota"],
  },
];

const ANALYSIS_STEPS = [
  "Understanding academic profile & preferences...",
  "Searching verified college database...",
  "Comparing cutoff eligibility & GPA requirements...",
  "Matching budget & tuition fee structure...",
  "Checking hostel availability & location proximity...",
  "Comparing placement statistics & ROI outcomes...",
  "Ranking colleges & generating recommendations...",
];

function RecommendationCard({
  rec,
  index,
  isSelectedForCompare,
  onToggleCompare,
}: {
  rec: Recommendation;
  index: number;
  isSelectedForCompare: boolean;
  onToggleCompare: (rec: Recommendation) => void;
}) {
  const [saved, setSaved] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all space-y-0"
    >
      {/* Hero Header */}
      <div className="relative h-48 bg-slate-900 overflow-hidden">
        <img
          src={rec.image}
          alt={rec.name}
          className="w-full h-full object-cover opacity-85"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/campus-hero.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Top Match Badge & Rankings */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="px-3 py-1.5 rounded-full bg-[#3b2075] text-amber-300 font-black text-xs shadow-md border border-purple-400/40 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{rec.matchScore}% Match Score</span>
            </div>

            {rec.naacGrade && (
              <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 font-extrabold text-[11px] shadow-xs">
                NAAC {rec.naacGrade}
              </span>
            )}
            {rec.nirfRank && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] shadow-xs">
                NIRF #{rec.nirfRank}
              </span>
            )}
          </div>

          <button
            onClick={() => setSaved(!saved)}
            className={`p-2 rounded-xl transition-all ${
              saved ? "bg-amber-400 text-stone-950" : "bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
            }`}
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Bottom Overlay Title */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-black text-amber-400">
              {rec.ownership || rec.type} Institution
            </span>
            <h3 className="text-lg md:text-xl font-black text-white leading-tight">{rec.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-stone-300 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{rec.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 md:p-6 space-y-4">
        {/* Core Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 text-center">
          <div>
            <div className="text-[10px] font-extrabold text-stone-500 uppercase">Annual Fee</div>
            <div className="text-sm font-black text-[#3b2075] mt-0.5">
              {rec.fees > 0 ? (rec.fees >= 100000 ? `₹${(rec.fees / 100000).toFixed(1)}L` : `₹${Math.round(rec.fees / 1000)}K`) : "Not Stated"}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-stone-500 uppercase">Avg Package</div>
            <div className="text-sm font-black text-emerald-700 mt-0.5">
              {rec.avgPackage > 0 ? `₹${rec.avgPackage} LPA` : "Not Published"}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-extrabold text-stone-500 uppercase">Highest CTC</div>
            <div className="text-sm font-black text-stone-900 mt-0.5">
              {rec.highestPackage > 0 ? `₹${rec.highestPackage} LPA` : "Not Published"}
            </div>
          </div>
        </div>

        {/* Why Recommended: Verified DB Reasons */}
        <div className="bg-[#faf8fc] border border-[#3b2075]/15 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-black text-[#3b2075]">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Why Recommended (Verified Real Data)</span>
          </div>
          <div className="space-y-1.5 pt-1">
            {rec.matchReasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-stone-700 leading-snug">
                <span className="text-emerald-600 font-extrabold shrink-0 mt-0.5">✓</span>
                <span>{reason.replace(/^✔\s*/, "")}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Link
            href={`/colleges/${rec.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#3b2075] hover:bg-[#2d1659] text-white text-xs font-extrabold rounded-xl transition-all shadow-sm"
          >
            <span>View Full Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {rec.website && (
            <a
              href={rec.website}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1 border border-stone-200"
            >
              <Globe className="w-3.5 h-3.5 text-[#3b2075]" />
              <span>Official Site</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => onToggleCompare(rec)}
            className={`px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all border flex items-center gap-1.5 cursor-pointer ${
              isSelectedForCompare
                ? "bg-amber-400 text-stone-950 border-amber-500 font-extrabold"
                : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{isSelectedForCompare ? "✓ Added" : "Compare"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CounselorPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "bot",
      content: STEPS[0].question,
      chips: STEPS[0].chips,
    },
  ]);
  const [input, setInput] = React.useState("");
  const [profile, setProfile] = React.useState<StudentProfile>({});
  const [loading, setLoading] = React.useState(false);
  const [stepIdx, setStepIdx] = React.useState(0);

  // Flow State: 'CHAT' | 'SUMMARY' | 'ANALYZING' | 'RESULTS'
  const [flowState, setFlowState] = React.useState<"CHAT" | "SUMMARY" | "ANALYZING" | "RESULTS">("CHAT");

  // Analysis Animation Progress State
  const [analysisProgress, setAnalysisProgress] = React.useState(0);
  const [analysisStepIdx, setAnalysisStepIdx] = React.useState(0);

  // Recommendations Data
  const [recommendations, setRecommendations] = React.useState<Recommendation[]>([]);
  const [dreamColleges, setDreamColleges] = React.useState<Recommendation[]>([]);
  const [bestMatches, setBestMatches] = React.useState<Recommendation[]>([]);
  const [safeColleges, setSafeColleges] = React.useState<Recommendation[]>([]);
  const [activeTab, setActiveTab] = React.useState<"BEST" | "DREAM" | "SAFE">("BEST");

  const [compareList, setCompareList] = React.useState<Recommendation[]>([]);
  const [showCompareModal, setShowCompareModal] = React.useState(false);

  const bottomRef = React.useRef<HTMLDivElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const handleToggleCompare = (rec: Recommendation) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item.id === rec.id);
      if (exists) return prev.filter((item) => item.id !== rec.id);
      if (prev.length >= 5) {
        alert("You can compare up to 5 colleges side-by-side!");
        return prev;
      }
      return [...prev, rec];
    });
  };

  const validateUserInput = (stepKey: string, text: string): { isValid: boolean; errorMessage?: string } => {
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. Check ultra short or single character gibberish
    if (trimmed.length < 2) {
      return {
        isValid: false,
        errorMessage: "⚠️ Please enter a correct sentence or selection so I can help you find the best colleges.",
      };
    }

    // Common random key mashing or repeating pattern check (e.g. "kk", "asdf", "qwerty", "zzz", "123", "???")
    const isRandomKeyMash = /^(?:[b-df-hj-np-tv-z]{2,}|(?:asdf|qwerty|zxcv|hjkl|kkk|kk|jjj|ggg|fff|ddd|sss|aaa|qqq|www|eee|rrr|ttt|yyy|uuu|iii|ooo|ppp|1234|000|xxx|yyy|zzz|\?+|\.+))+$/i.test(trimmed);
    
    if (isRandomKeyMash) {
      return {
        isValid: false,
        errorMessage: "⚠️ Please enter a correct sentence or valid response (e.g. Engineering, Computer Science, 92%, or Cutoff 185) so I can assist you properly.",
      };
    }

    // 2. Step-Specific Validation Rules
    switch (stepKey) {
      case "stream": {
        const validStreams = /engineering|b\.?tech|arts|science|medical|neet|law|management|mba|commerce|agriculture|architecture|ca|cs|b\.?com|bba|bca|bsc|ba|mbbs|nursing|pharmacy|diploma|polytechnic|tnea|jee/i;
        if (!validStreams.test(lower)) {
          return {
            isValid: false,
            errorMessage: "⚠️ Please enter a valid academic stream (e.g., Engineering, Medical, Arts & Science, Management, Law, or Commerce).",
          };
        }
        break;
      }
      case "score12th": {
        const hasNumber = /\d+/.test(lower);
        const scoreKeywords = /cutoff|percentage|hsc|12th|marks|grade|pass|above|below|95|90|85|80|75|70|60|50/i;
        if (!hasNumber && !scoreKeywords.test(lower)) {
          return {
            isValid: false,
            errorMessage: "⚠️ Please enter a valid Class 12th percentage or TNEA Cutoff score (e.g., 92%, Cutoff 185, or 85–90%).",
          };
        }
        break;
      }
      case "entranceExam": {
        const validExams = /tnea|jee|neet|cuet|cat|mat|tancet|gate|clat|cmat|merit|no entrance|direct|board marks|counseling|counselling|none/i;
        if (!validExams.test(lower)) {
          return {
            isValid: false,
            errorMessage: "⚠️ Please specify a valid entrance exam or admission process (e.g., TNEA Counselling, JEE Main, NEET UG, CUET, or Merit Based).",
          };
        }
        break;
      }
      case "specialization": {
        const validCourses = /computer|cse|ai|data|electronics|ece|biotech|mech|civil|bca|it|mba|finance|marketing|medical|law|nursing|pharmacy|b\.?com|b\.?sc|arts|any|all|degree/i;
        if (!validCourses.test(lower) && trimmed.length < 3) {
          return {
            isValid: false,
            errorMessage: "⚠️ Please enter a valid course or specialization (e.g., Computer Science & AI, Electronics, Mechanical, MBA, or BCA).",
          };
        }
        break;
      }
      case "locationPreference": {
        const validLocations = /chennai|coimbatore|madurai|trichy|salem|tirunelveli|vellore|erode|thanjavur|kanchipuram|tamil nadu|bangalore|karnataka|india|any|all|location|city|district|near/i;
        if (!validLocations.test(lower) && trimmed.length < 3) {
          return {
            isValid: false,
            errorMessage: "⚠️ Please enter a valid city or location preference (e.g., Chennai, Coimbatore, Trichy, or Any Location in Tamil Nadu).",
          };
        }
        break;
      }
      case "budget": {
        const hasNumber = /\d+/.test(lower);
        const validBudget = /budget|lakh|lakhs|l|k|rupees|rs|under|above|open|scholarship|free|low|high|any|fee|tuition/i;
        if (!hasNumber && !validBudget.test(lower)) {
          return {
            isValid: false,
            errorMessage: "⚠️ Please enter a valid annual tuition fee budget (e.g., Under ₹1L, ₹2L – ₹4L, or Open to scholarships).",
          };
        }
        break;
      }
      case "hostel": {
        const validHostel = /yes|no|hostel|day scholar|commuting|stay|room|campus|required|not required|needed|dont need/i;
        if (!validHostel.test(lower)) {
          return {
            isValid: false,
            errorMessage: "⚠️ Please clarify if you require on-campus hostel facilities (e.g., Yes — On-campus hostel required or No — Day scholar).",
          };
        }
        break;
      }
      case "ownershipPreference": {
        const validOwnership = /government|govt|aided|autonomous|private|university|deemed|no preference|any|all/i;
        if (!validOwnership.test(lower)) {
          return {
            isValid: false,
            errorMessage: "⚠️ Please select your preferred college type (e.g., Government / Govt-Aided, Autonomous, Private Universities, or No Preference).",
          };
        }
        break;
      }
      case "expectedPackage": {
        const hasNumber = /\d+/.test(lower);
        const validPackage = /lpa|lakh|lakhs|package|salary|placement|not focused|any|high|average/i;
        if (!hasNumber && !validPackage.test(lower)) {
          return {
            isValid: false,
            errorMessage: "⚠️ Please enter a valid target placement package expectation (e.g., ₹4–6 LPA, ₹6–10 LPA, or ₹10–15 LPA).",
          };
        }
        break;
      }
      case "category": {
        const validCategory = /oc|bc|bcm|mbc|dnc|sc|st|general|first graduate|sports|quota|reservation|open/i;
        if (!validCategory.test(lower)) {
          return {
            isValid: false,
            errorMessage: "⚠️ Please select a valid category or quota (e.g., OC / General, BC / BCM, MBC / DNC, SC / ST, or First Graduate Quota).",
          };
        }
        break;
      }
    }

    return { isValid: true };
  };

  const handleSendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    // Validate input against current question step before advancing
    const currentStep = STEPS[stepIdx];
    if (currentStep && currentStep.key) {
      const validation = validateUserInput(currentStep.key, userText);
      if (!validation.isValid) {
        const userMsg: Message = { role: "user", content: userText };
        const botErrMsg: Message = {
          role: "bot",
          content: `${validation.errorMessage}\n\n${currentStep.question}`,
          chips: currentStep.chips,
        };
        setMessages((prev) => [...prev.map((m) => ({ ...m, chips: undefined })), userMsg, botErrMsg]);
        setInput("");
        return;
      }
    }

    const userMsg: Message = { role: "user", content: userText };
    setMessages((prev) => [...prev.map((m) => ({ ...m, chips: undefined })), userMsg]);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content,
      }));

      const res = await fetch("/api/counselor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: chatHistory,
          currentProfile: profile,
        }),
      });

      const data = await res.json();

      const currentStep = STEPS[stepIdx];
      let updatedProfile = { ...profile };

      if (currentStep && currentStep.key) {
        (updatedProfile as any)[currentStep.key] = userText;
      }

      if (data.extractedProfile) {
        updatedProfile = { ...updatedProfile, ...data.extractedProfile };
      }

      setProfile(updatedProfile);

      // Check if all steps completed
      const nextStepIdx = stepIdx + 1;
      setStepIdx(nextStepIdx);

      if (nextStepIdx >= STEPS.length) {
        // All questions collected -> Transition to SUMMARY phase
        setFlowState("SUMMARY");
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: "✓ Perfect! I have compiled your complete academic profile. Review your preferences in the Summary box below and click 'Predict Colleges' when you are ready for AI database analysis.",
          },
        ]);
      } else {
        const nextStep = STEPS[nextStepIdx];
        const botMsg: Message = {
          role: "bot",
          content: nextStep.question,
          chips: nextStep.chips,
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error("Counselor Chat API Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "I experienced a minor connection hiccup. Please reply again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Run AI Reasoning & Database Analysis Animation (4 - 6 seconds)
  const handleStartPrediction = async () => {
    setFlowState("ANALYZING");
    setAnalysisProgress(5);
    setAnalysisStepIdx(0);

    // Fetch database recommendations in background
    let fetchedData: any = null;
    const fetchPromise = fetch("/api/counselor-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Predict colleges for my complete profile",
        history: [],
        currentProfile: profile,
      }),
    }).then((res) => res.json());

    // Animate progress smoothly over ~5 seconds
    const totalSteps = ANALYSIS_STEPS.length;
    for (let i = 0; i < totalSteps; i++) {
      setAnalysisStepIdx(i);
      const targetPct = Math.round(((i + 1) / totalSteps) * 100);
      setAnalysisProgress(targetPct);
      await new Promise((resolve) => setTimeout(resolve, 750));
    }

    try {
      fetchedData = await fetchPromise;
      if (fetchedData) {
        if (Array.isArray(fetchedData.recommendations)) setRecommendations(fetchedData.recommendations);
        if (Array.isArray(fetchedData.dreamColleges)) setDreamColleges(fetchedData.dreamColleges);
        if (Array.isArray(fetchedData.bestMatches)) setBestMatches(fetchedData.bestMatches);
        if (Array.isArray(fetchedData.safeColleges)) setSafeColleges(fetchedData.safeColleges);
      }
    } catch (e) {
      console.error("Failed to fetch final prediction:", e);
    }

    setFlowState("RESULTS");
  };

  const handleStartOver = () => {
    setMessages([{ role: "bot", content: STEPS[0].question, chips: STEPS[0].chips }]);
    setProfile({});
    setStepIdx(0);
    setRecommendations([]);
    setDreamColleges([]);
    setBestMatches([]);
    setSafeColleges([]);
    setCompareList([]);
    setFlowState("CHAT");
  };

  const activeRecommendations =
    activeTab === "DREAM"
      ? dreamColleges
      : activeTab === "SAFE"
      ? safeColleges
      : bestMatches.length
      ? bestMatches
      : recommendations;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#faf8fc] pt-4 pb-16 font-sans">
        <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#1f0c3d] via-[#2d1659] to-[#3b2075] p-6 rounded-3xl border border-[#3b2075]/80 shadow-md text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-lg border border-amber-300 shrink-0 overflow-hidden">
                  <img src="/images/leo-mascot.png" alt="Leo Bot" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                    <span>Leo Bot — AI Admissions Counselor</span>
                    <span className="px-2.5 py-0.5 bg-orange-500 text-white font-extrabold text-[10px] rounded-full uppercase shadow-xs">
                      Admission Assistant
                    </span>
                  </h1>
                  <p className="text-xs text-purple-200 mt-1 font-medium">
                    Step-by-step admissions chat • Zero assumptions • Live database prediction
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="px-4 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-xs font-bold transition-all border border-purple-400/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-300" />
                  <span>Start Over</span>
                </button>

                {compareList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCompareModal(true)}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Scale className="w-4 h-4" />
                    <span>Compare ({compareList.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* MAIN WORKFLOW AREA */}

          {/* PHASE 1 & 2: CHAT & SUMMARY (ZERO COLLEGES SHOWN) */}
          {(flowState === "CHAT" || flowState === "SUMMARY") && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Chat Column */}
              <div className="md:col-span-2 space-y-5">
                <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs flex flex-col min-h-[500px]">
                  <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-4 max-h-[540px]">
                    <AnimatePresence>
                      {messages.map((msg, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {msg.role === "bot" && (
                            <div className="w-9 h-9 rounded-2xl bg-white border border-purple-200 p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                              <img src="/images/leo-mascot.png" alt="Leo Bot" loading="lazy" decoding="async" className="w-full h-full object-contain" />
                            </div>
                          )}

                          <div className="max-w-md space-y-2.5">
                            <div
                              className={`px-4 py-3 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                                msg.role === "bot"
                                  ? "bg-[#faf8fc] text-stone-800 border border-purple-100 rounded-tl-xs font-medium"
                                  : "bg-[#3b2075] text-white rounded-tr-xs font-medium shadow-xs"
                              }`}
                            >
                              {msg.content}
                            </div>

                            {msg.chips && flowState === "CHAT" && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {msg.chips.map((chip) => (
                                  <button
                                    key={chip}
                                    type="button"
                                    onClick={() => handleSendMessage(chip)}
                                    className="px-3.5 py-1.5 text-xs font-bold bg-white text-[#3b2075] border border-[#3b2075]/30 hover:bg-[#3b2075] hover:text-white rounded-full transition-all shadow-2xs cursor-pointer"
                                  >
                                    {chip}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {msg.role === "user" && (
                            <div className="w-9 h-9 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow-xs font-extrabold">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {loading && (
                      <div className="flex gap-3 items-center">
                        <div className="w-9 h-9 rounded-2xl bg-[#3b2075] text-amber-300 flex items-center justify-center shrink-0">
                          <Bot className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="px-4 py-3 bg-purple-50 rounded-2xl text-xs text-purple-900 font-extrabold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                          <span>Processing response...</span>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input Form */}
                  {flowState === "CHAT" && (
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="p-4 border-t border-stone-100 bg-white flex items-center gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your reply (e.g. 92% in 12th, Cutoff 182, Budget 1L)..."
                        className="flex-1 px-4 py-3 bg-[#faf8fc] border border-stone-300 rounded-2xl text-xs md:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#3b2075]/30 font-medium"
                      />
                      <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="px-5 py-3 rounded-2xl bg-[#3b2075] hover:bg-[#2d1659] text-amber-300 text-xs font-extrabold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Send</span>
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* Sidebar Summary & Trigger Button */}
              <div className="space-y-5">
                <div className="bg-white border border-[#3b2075]/20 rounded-3xl p-6 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <h3 className="text-xs font-black text-[#3b2075] uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Profile Summary</span>
                    </h3>
                    <span className="text-[10px] bg-purple-100 text-[#3b2075] font-extrabold px-2.5 py-0.5 rounded-full">
                      Step {Math.min(stepIdx, STEPS.length)} / {STEPS.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-stone-700">
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="font-semibold text-stone-400">Stream:</span>
                      <span className="font-extrabold text-stone-900">{profile.stream || "Pending..."}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="font-semibold text-stone-400">12th Score / Cutoff:</span>
                      <span className="font-extrabold text-stone-900">{profile.score12th || "Pending..."}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="font-semibold text-stone-400">Entrance Exam:</span>
                      <span className="font-extrabold text-stone-900">{profile.entranceExam || "Pending..."}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="font-semibold text-stone-400">Specialization:</span>
                      <span className="font-extrabold text-stone-900">{profile.specialization || "Pending..."}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="font-semibold text-stone-400">Preferred Location:</span>
                      <span className="font-extrabold text-stone-900">{profile.locationPreference || "Pending..."}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="font-semibold text-stone-400">Annual Budget:</span>
                      <span className="font-extrabold text-stone-900">{profile.budget || "Pending..."}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-50">
                      <span className="font-semibold text-stone-400">On-Campus Hostel:</span>
                      <span className="font-extrabold text-stone-900">{profile.hostel || "Pending..."}</span>
                    </div>
                  </div>

                  {/* PREDICT COLLEGES BUTTON (SHOWN WHEN COMPLETE / SUMMARY PHASE) */}
                  {flowState === "SUMMARY" ? (
                    <button
                      type="button"
                      onClick={handleStartPrediction}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-orange-700 text-white text-sm font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                    >
                      <Sparkles className="w-5 h-5 text-amber-200" />
                      <span>✨ Predict Colleges</span>
                    </button>
                  ) : (
                    <p className="text-[11px] text-stone-400 font-medium text-center italic">
                      Complete chat questions to unlock College Prediction
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PHASE 3: PREMIUM AI LOADING & DATABASE REASONING ANIMATION */}
          {flowState === "ANALYZING" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#1f0c3d] via-[#2d1659] to-[#3b2075] text-white rounded-3xl p-8 md:p-12 shadow-2xl border border-[#3b2075] space-y-8 max-w-3xl mx-auto my-8"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-amber-400 text-stone-950 flex items-center justify-center font-black text-2xl mx-auto shadow-xl">
                  <Bot className="w-8 h-8 text-stone-950 animate-bounce" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white">
                  🤖 AI Reasoning & Database Analysis
                </h2>
                <p className="text-xs md:text-sm text-purple-200 font-medium max-w-lg mx-auto">
                  Performing deep multi-attribute matching across official college database records...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2 max-w-xl mx-auto">
                <div className="flex justify-between text-xs font-black text-amber-300 uppercase tracking-wider">
                  <span>AI Analysis Progress</span>
                  <span>{analysisProgress}%</span>
                </div>
                <div className="w-full bg-purple-950/80 rounded-full h-3 overflow-hidden border border-purple-400/30 p-0.5">
                  <motion.div
                    className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full"
                    animate={{ width: `${analysisProgress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Animated Checklist Items */}
              <div className="space-y-2.5 max-w-lg mx-auto bg-purple-950/60 p-5 rounded-2xl border border-purple-800/60 text-xs">
                {ANALYSIS_STEPS.map((stepText, idx) => {
                  const isDone = idx <= analysisStepIdx;
                  const isCurrent = idx === analysisStepIdx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 transition-all ${
                        isDone ? "text-white font-bold" : "text-purple-300/40"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Sparkles className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-purple-700 shrink-0" />
                      )}
                      <span>{stepText}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* PHASE 4: CATEGORIZED RESULTS SCREEN (BEST MATCHES, DREAM, SAFE) */}
          {flowState === "RESULTS" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Category Tabs Bar */}
              <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("BEST")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "BEST"
                        ? "bg-[#3b2075] text-amber-300 shadow-md"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>🌟 Best Matches ({bestMatches.length || recommendations.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("DREAM")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "DREAM"
                        ? "bg-[#3b2075] text-amber-300 shadow-md"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>🏆 Dream Colleges ({dreamColleges.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("SAFE")}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === "SAFE"
                        ? "bg-[#3b2075] text-amber-300 shadow-md"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>🛡️ Safe Colleges ({safeColleges.length})</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleStartOver}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all border border-stone-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>New Prediction</span>
                </button>
              </div>

              {/* College Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeRecommendations.map((rec, i) => (
                  <RecommendationCard
                    key={rec.id}
                    rec={rec}
                    index={i}
                    isSelectedForCompare={compareList.some((c) => c.id === rec.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Side-by-Side Comparison Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-6 md:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#3b2075]" />
                  <span>Side-by-Side College Comparison</span>
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  Comparing {compareList.length} colleges using real verified database data
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold px-2"
              >
                ✕
              </button>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-purple-50/50">
                    <th className="p-3 font-extrabold text-stone-700 w-44">Metric</th>
                    {compareList.map((col) => (
                      <th key={col.id} className="p-3 font-black text-[#3b2075] text-sm min-w-[200px]">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <tr>
                    <td className="p-3 font-bold text-stone-500">Match Score</td>
                    {compareList.map((col) => (
                      <td key={col.id} className="p-3 font-black text-emerald-700 text-sm">
                        {col.matchScore}% Match
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-stone-500">Location</td>
                    {compareList.map((col) => (
                      <td key={col.id} className="p-3 font-semibold text-stone-800">
                        {col.location}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-stone-500">Annual Fee</td>
                    {compareList.map((col) => (
                      <td key={col.id} className="p-3 font-extrabold text-stone-900">
                        {col.fees > 0 ? `₹${col.fees.toLocaleString("en-IN")}` : "Not Stated"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-stone-500">Avg Package</td>
                    {compareList.map((col) => (
                      <td key={col.id} className="p-3 font-extrabold text-emerald-700">
                        {col.avgPackage > 0 ? `₹${col.avgPackage} LPA` : "Not Published"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-stone-500">Highest CTC</td>
                    {compareList.map((col) => (
                      <td key={col.id} className="p-3 font-extrabold text-stone-900">
                        {col.highestPackage > 0 ? `₹${col.highestPackage} LPA` : "Not Published"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-stone-500">NAAC Grade</td>
                    {compareList.map((col) => (
                      <td key={col.id} className="p-3 font-bold text-amber-700">
                        {col.naacGrade || "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-stone-500">NIRF Ranking</td>
                    {compareList.map((col) => (
                      <td key={col.id} className="p-3 font-bold text-purple-900">
                        {col.nirfRank ? `#${col.nirfRank}` : "N/A"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-stone-500">On-Campus Hostel</td>
                    {compareList.map((col) => (
                      <td key={col.id} className="p-3 font-bold">
                        {col.hostelAvailable ? "✔ Available" : "❌ Off-Campus"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end border-t border-stone-200 pt-4">
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="px-5 py-2.5 bg-[#3b2075] text-white text-xs font-extrabold rounded-xl shadow-xs"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
