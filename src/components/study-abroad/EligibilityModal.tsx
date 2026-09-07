"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  GraduationCap,
  Award,
  Globe,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  Loader2,
  ShieldCheck,
  Building2,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCountry?: string;
  defaultCourse?: string;
}

const courseOptions = [
  "Computer Science",
  "Business & Management",
  "Engineering",
  "Data Science",
  "Healthcare",
  "Finance",
  "Cyber Security",
  "Artificial Intelligence",
  "Biotechnology"
];

const qualificationOptions = [
  "12th Standard (Higher Secondary)",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree"
];

const englishTestOptions = ["IELTS", "TOEFL", "PTE", "Not taken yet"];

const budgetOptions = [
  "Below ₹15 Lakhs / year",
  "₹15 Lakhs - ₹25 Lakhs / year",
  "₹25 Lakhs - ₹40 Lakhs / year",
  "Above ₹40 Lakhs / year"
];

const intakeOptions = [
  "Fall Intake (August / September)",
  "Spring Intake (January / February)",
  "Summer Intake (May / June)"
];

export function EligibilityModal({
  isOpen,
  onClose,
  defaultCountry = "United States (USA)",
  defaultCourse = ""
}: EligibilityModalProps) {
  const { user } = useAuth();

  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Form State
  const [selectedCountry, setSelectedCountry] = React.useState(defaultCountry);
  const [preferredCourse, setPreferredCourse] = React.useState(defaultCourse || "Computer Science");
  const [qualification, setQualification] = React.useState("Bachelor's Degree");
  const [academicScore, setAcademicScore] = React.useState("75%");
  const [englishTest, setEnglishTest] = React.useState("IELTS");
  const [englishScore, setEnglishScore] = React.useState("7.0");
  const [budget, setBudget] = React.useState("₹25 Lakhs - ₹40 Lakhs / year");
  const [preferredIntake, setPreferredIntake] = React.useState("Fall Intake (August / September)");

  // Contact Info (Auto-filled if logged in)
  const [studentName, setStudentName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  // Result state
  const [resultData, setResultData] = React.useState<any>(null);

  React.useEffect(() => {
    if (user) {
      if (user.name) setStudentName(user.name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  React.useEffect(() => {
    if (defaultCountry) setSelectedCountry(defaultCountry);
    if (defaultCourse) setPreferredCourse(defaultCourse);
  }, [defaultCountry, defaultCourse]);

  if (!isOpen) return null;

  function handleNext() {
    setErrorMsg("");
    if (step === 3 && !academicScore.trim()) {
      setErrorMsg("Please enter your academic score or percentage.");
      return;
    }
    if (step === 8) {
      handleSubmit();
      return;
    }
    setStep((prev) => prev + 1);
  }

  function handleBack() {
    setErrorMsg("");
    setStep((prev) => Math.max(1, prev - 1));
  }

  async function handleSubmit() {
    if (!studentName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg("Please fill in your name, email, and mobile number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/study-abroad/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user?.id || null,
          studentName: studentName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          selectedCountry,
          preferredCourse,
          qualification,
          academicScore,
          englishTest,
          englishScore,
          budget,
          preferredIntake
        })
      });

      if (!res.ok) {
        let errMessage = "Failed to process eligibility request.";
        try {
          if (res.headers.get("content-type")?.includes("application/json")) {
            const errData = await res.json();
            errMessage = errData.error || errMessage;
          }
        } catch (_) {}
        setErrorMsg(errMessage);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setResultData(data.profileResult);
        setStep(9); // Show Profile Result Step
      } else {
        setErrorMsg(data.error || "Failed to process eligibility request.");
      }
    } catch (err) {
      console.error("Eligibility submission error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white border border-purple-200/80 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-[#1f0c3d] text-white p-5 sm:p-6 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1 z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
              <span>Study Abroad Eligibility Assessment</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
              {step === 9 ? "Your Study Abroad Profile" : `Check Eligibility for ${selectedCountry}`}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar (For Steps 1-8) */}
        {step <= 8 && (
          <div className="bg-purple-50/70 border-b border-purple-100 px-6 py-2.5 flex items-center justify-between text-xs font-semibold text-purple-900 shrink-0">
            <span>Step {step} of 8</span>
            <div className="w-36 sm:w-48 bg-purple-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#ea580c] to-[#3b2075] h-full transition-all duration-300"
                style={{ width: `${(step / 8) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Course Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-extrabold text-[#1f0c3d] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#ea580c]" />
                    <span>What discipline or course do you want to study?</span>
                  </label>
                  <p className="text-xs text-stone-500">
                    Select your primary field of interest for higher studies in {selectedCountry}.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {courseOptions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setPreferredCourse(c)}
                      className={`p-3 rounded-2xl text-xs font-bold text-left transition-all border cursor-pointer ${
                        preferredCourse === c
                          ? "bg-[#3b2075] text-white border-[#3b2075] shadow-md"
                          : "bg-stone-50 hover:bg-purple-50/50 border-stone-200 text-stone-700"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="pt-2 space-y-1">
                  <span className="text-xs text-stone-500 font-semibold">Or enter custom course title:</span>
                  <input
                    type="text"
                    value={preferredCourse}
                    onChange={(e) => setPreferredCourse(e.target.value)}
                    placeholder="e.g. M.Sc Robotics, LLM International Law"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:border-[#3b2075] outline-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Highest Qualification */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-extrabold text-[#1f0c3d] flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#ea580c]" />
                    <span>What is your highest completed qualification?</span>
                  </label>
                  <p className="text-xs text-stone-500">
                    This determines your degree level entry requirements (UG vs PG).
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {qualificationOptions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQualification(q)}
                      className={`w-full p-4 rounded-2xl text-xs font-bold text-left transition-all border flex items-center justify-between cursor-pointer ${
                        qualification === q
                          ? "bg-[#3b2075] text-white border-[#3b2075] shadow-md"
                          : "bg-stone-50 hover:bg-purple-50/50 border-stone-200 text-stone-700"
                      }`}
                    >
                      <span>{q}</span>
                      {qualification === q && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Academic Score */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-extrabold text-[#1f0c3d] flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#ea580c]" />
                    <span>What is your aggregate academic score or percentage?</span>
                  </label>
                  <p className="text-xs text-stone-500">
                    Enter your overall 12th percentage, Diploma aggregate, or Graduation CGPA.
                  </p>
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    value={academicScore}
                    onChange={(e) => setAcademicScore(e.target.value)}
                    placeholder="e.g. 78%, 8.2 CGPA, First Class with Distinction"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm font-bold focus:border-[#3b2075] outline-none shadow-inner"
                  />
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-xs text-purple-900 leading-relaxed">
                  💡 <strong>Tip:</strong> Top institutions in {selectedCountry} typically consider 65%+ or 3.0+ GPA for direct admission eligibility.
                </div>
              </motion.div>
            )}

            {/* Step 4: English Test Selection */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-extrabold text-[#1f0c3d] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#ea580c]" />
                    <span>Which English language proficiency test have you taken?</span>
                  </label>
                  <p className="text-xs text-stone-500">
                    Most international universities require official English proficiency scores.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {englishTestOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEnglishTest(t)}
                      className={`p-4 rounded-2xl text-xs font-bold text-center transition-all border cursor-pointer ${
                        englishTest === t
                          ? "bg-[#3b2075] text-white border-[#3b2075] shadow-md"
                          : "bg-stone-50 hover:bg-purple-50/50 border-stone-200 text-stone-700"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Test Score */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-extrabold text-[#1f0c3d] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#ea580c]" />
                    <span>Enter your {englishTest} score (or target score)</span>
                  </label>
                  <p className="text-xs text-stone-500">
                    {englishTest === "Not taken yet"
                      ? "If planning to take soon, enter your target band score."
                      : "Enter your overall band score or TOEFL/PTE points."}
                  </p>
                </div>

                <div className="pt-2">
                  <input
                    type="text"
                    value={englishScore}
                    onChange={(e) => setEnglishScore(e.target.value)}
                    placeholder="e.g. 7.0 (IELTS) / 95 (TOEFL) / 65 (PTE)"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-sm font-bold focus:border-[#3b2075] outline-none shadow-inner"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 6: Budget Range */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-extrabold text-[#1f0c3d] flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#ea580c]" />
                    <span>What is your approximate annual budget (Tuition + Living)?</span>
                  </label>
                  <p className="text-xs text-stone-500">
                    Helps us match you with universities that fit your financial expectations.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {budgetOptions.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBudget(b)}
                      className={`w-full p-3.5 rounded-2xl text-xs font-bold text-left transition-all border flex items-center justify-between cursor-pointer ${
                        budget === b
                          ? "bg-[#3b2075] text-white border-[#3b2075] shadow-md"
                          : "bg-stone-50 hover:bg-purple-50/50 border-stone-200 text-stone-700"
                      }`}
                    >
                      <span>{b}</span>
                      {budget === b && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 7: Preferred Intake */}
            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-extrabold text-[#1f0c3d] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#ea580c]" />
                    <span>Which admission intake are you aiming for?</span>
                  </label>
                  <p className="text-xs text-stone-500">
                    Universities in {selectedCountry} operate on major seasonal academic intakes.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {intakeOptions.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPreferredIntake(i)}
                      className={`w-full p-4 rounded-2xl text-xs font-bold text-left transition-all border flex items-center justify-between cursor-pointer ${
                        preferredIntake === i
                          ? "bg-[#3b2075] text-white border-[#3b2075] shadow-md"
                          : "bg-stone-50 hover:bg-purple-50/50 border-stone-200 text-stone-700"
                      }`}
                    >
                      <span>{i}</span>
                      {preferredIntake === i && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 8: Contact Details */}
            {step === 8 && (
              <motion.div
                key="step8"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-extrabold text-[#1f0c3d] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#ea580c]" />
                    <span>Enter your contact details to generate your profile</span>
                  </label>
                  <p className="text-xs text-stone-500">
                    {user ? "Your registered profile information has been automatically auto-filled." : "Provide your details so our counselors can share official university prospectuses."}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:border-[#3b2075] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:border-[#3b2075] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">Mobile Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:border-[#3b2075] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 9: Result View ("Your Study Abroad Profile") */}
            {step === 9 && resultData && (
              <motion.div
                key="step9"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Header Badge */}
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3b2075] block">
                      Target Destination: {resultData.selectedCountry}
                    </span>
                    <h4 className="text-base font-serif font-bold text-[#1f0c3d]">
                      {resultData.studentName}&apos;s Profile Analysis
                    </h4>
                  </div>
                  <span className="px-3 py-1 bg-[#3b2075] text-white text-xs font-extrabold rounded-full">
                    {resultData.preferredCourse}
                  </span>
                </div>

                {/* Potentially Suitable Universities */}
                <div className="space-y-2.5">
                  <h5 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#ea580c]" />
                    <span>Potentially Suitable Universities</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {resultData.potentialMatches.map((m: any, i: number) => (
                      <div
                        key={i}
                        className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900">{m.name}</span>
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            {m.matchConfidence}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 font-sans">{m.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Budget Alignment */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-1">
                  <span className="text-xs font-extrabold text-[#1f0c3d] flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#ea580c]" />
                    <span>Estimated Budget Alignment</span>
                  </span>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {resultData.budgetFit}
                  </p>
                </div>

                {/* Missing Criteria */}
                {resultData.missingRequirements && resultData.missingRequirements.length > 0 && (
                  <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Pending Requirements / Criteria Gaps</span>
                    </span>
                    <ul className="space-y-1 text-xs text-amber-950 list-disc list-inside font-sans">
                      {resultData.missingRequirements.map((req: string, idx: number) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Next Steps */}
                <div className="space-y-2">
                  <h5 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#3b2075]" />
                    <span>Recommended Next Action Items</span>
                  </h5>
                  <div className="space-y-1.5">
                    {resultData.recommendedNextSteps.map((stepItem: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-stone-700 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{stepItem}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legal Disclaimer Box */}
                <div className="p-3 bg-stone-100 border border-stone-200 rounded-xl text-[10.5px] text-stone-500 font-sans leading-relaxed">
                  ⚠️ <strong>Disclaimer:</strong> {resultData.disclaimer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          {step > 1 && step <= 8 ? (
            <button
              onClick={handleBack}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-200/60 text-stone-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step <= 8 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#3b2075] hover:bg-[#ea580c] text-white text-xs font-extrabold transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Profile...</span>
                </>
              ) : step === 8 ? (
                <>
                  <span>Submit & View Results</span>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#3b2075] hover:bg-[#ea580c] text-white text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Done / Close</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
